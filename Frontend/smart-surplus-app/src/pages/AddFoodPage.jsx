import React, { useState } from 'react';
import { useFood } from '../context/FoodContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';

// Helper function to convert an image file to Base64
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = error => reject(error);
});

// Helper function to format a Date object to a local datetime string
const formatLocalDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const AddFoodPage = () => {
    const { addFood } = useFood();
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [formData, setFormData] = useState({
        title: '',
        source: '',
        quantity: '',
        foodType: 'cooked_meal',
        storageCondition: 'Refrigerated',
        preparationTime: formatLocalDate(new Date()),
        expiresAt: '',
    });

    const [imageFile, setImageFile] = useState(null);
    const [imagePreview, setImagePreview] = useState('');
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');
    const [currentStep, setCurrentStep] = useState(1);

    const { title, source, quantity, foodType, storageCondition, preparationTime, expiresAt } = formData;

    const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

    const onFileChange = e => {
        const file = e.target.files[0];
        if (file) {
            setImageFile(file);
            setImagePreview(URL.createObjectURL(file));
            setCurrentStep(2);
        }
    };

    const handleAnalyze = async () => {
        setIsAnalyzing(true);
        setError('');

        try {
            const base64ImageData = await toBase64(imageFile);
            
            const prompt = `
                You are an expert food safety analyst for the ZeroBite app.
                Based on the attached image and the following details, your task is to:
                1. Suggest a concise, descriptive title for the food item.
                2. Estimate a safe consumption window in hours from the preparation time.

                Food Details:
                - Food Type: ${foodType}
                - Quantity: ${quantity} portions
                - Storage Condition: ${storageCondition}
                - Preparation Time: ${new Date(preparationTime).toLocaleString()}

                **Crucially, consider how the 'Storage Condition' (e.g., 'Uncovered Room Temp' vs 'Refrigerated') significantly impacts the food's safety and shortens its shelf life.** An uncovered item at room temperature will expire much faster than a refrigerated one.

                Analyze the image and the data. Respond with ONLY a valid JSON object string. Do not add any other text, explanation, or markdown formatting. The response must be a raw string that can be parsed directly, like this:
                {"suggestedTitle": "A short, descriptive name for the food","expiryHours": 12}
            `;

            const payload = {
                contents: [
                    {
                        role: "user",
                        parts: [
                            { text: prompt },
                            {
                                inlineData: {
                                    mimeType: imageFile.type,
                                    data: base64ImageData
                                }
                            }
                        ]
                    }
                ]
            };
            
            const apiKey = "AIzaSyDSLbrH5iFO3bDXAsuVjgntHzDl6IPhjfs";
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error(`AI analysis failed with status ${response.status}`);
            }
            
            const result = await response.json();
            const rawResponseText = result.candidates[0].content.parts[0].text;
            console.log("🤖 Raw AI Response Text:", rawResponseText);

            const aiResponse = JSON.parse(rawResponseText);
            const { suggestedTitle, expiryHours } = aiResponse;

            if (!suggestedTitle || isNaN(expiryHours) || expiryHours <= 0) {
                throw new Error("The AI returned an invalid response format.");
            }
            
            const prepDate = new Date(preparationTime);
            const expiryDate = new Date(prepDate.getTime() + expiryHours * 60 * 60 * 1000);
            
            setFormData({
                ...formData,
                title: suggestedTitle,
                expiresAt: formatLocalDate(expiryDate)
            });

            setCurrentStep(4);
        } catch (err) {
            console.error("Error during AI analysis:", err);
            setError(t('addFood.errors.aiFail'));
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!imageFile) {
            alert(t('addFood.errors.noImage'));
            return;
        }
        setIsSubmitting(true);
        setError('');

        try {
            const uploadFormData = new FormData();
            uploadFormData.append('image', imageFile);

            const uploadRes = await api.post('/upload', uploadFormData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const imageUrl = uploadRes.data.imageUrl;
            const success = await addFood({ ...formData, imageUrl });
            
            if (success) {
                navigate('/browse');
            } else {
                setError(t('addFood.errors.addFail'));
            }
        } catch (err) {
            console.error("Error creating food listing:", err);
            setError(t('addFood.errors.uploadFail'));
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isAnalyzeDisabled = !imageFile || !quantity || !foodType || !storageCondition || !preparationTime || isAnalyzing || isSubmitting;

    const progressSteps = [
        { number: 1, title: t('addFood.progress.step1'), active: currentStep >= 1 },
        { number: 2, title: t('addFood.progress.step2'), active: currentStep >= 2 },
        { number: 3, title: t('addFood.progress.step3'), active: currentStep >= 3 },
        { number: 4, title: t('addFood.progress.step4'), active: currentStep >= 4 }
    ];

    return (
        <div className="min-h-screen bg-gray-50 p-6 sm:p-8 font-sans flex items-center justify-center">
            <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden">
                <div className="p-8 sm:p-12 bg-gradient-to-r from-[#1A3C34] to-[#2E4F4F] text-white">
                    <h1 className="text-3xl sm:text-4xl font-bold mb-3 tracking-tight">{t('addFood.title')}</h1>
                    <p className="text-lg opacity-90">{t('addFood.subtitle')}</p>
                </div>

                <div className="p-8 sm:p-12">
                    <div className="flex items-center justify-center gap-4 mb-10">
                        {progressSteps.map((step, index) => (
                            <div key={step.number} className="relative flex items-center">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step.active ? 'bg-[#F28C38] text-white scale-110' : 'bg-gray-200 text-gray-600'}`}>
                                    {step.number}
                                </div>
                                {index < progressSteps.length - 1 && (
                                    <div className={`h-1 w-12 sm:w-24 ${step.active ? 'bg-[#F28C38]' : 'bg-gray-200'} transition-colors duration-300`} />
                                )}
                            </div>
                        ))}
                    </div>

                    <form onSubmit={onSubmit}>
                        {/* Step 1: Image Upload */}
                        <div className="mb-12">
                            <div className="flex items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800">{t('addFood.sections.upload')}</h3>
                            </div>
                            <input 
                                type="file" 
                                onChange={onFileChange} 
                                accept="image/*" 
                                id="file-upload"
                                className="hidden"
                            />
                            <label htmlFor="file-upload" className="block w-full h-64 border-2 border-dashed border-gray-300 rounded-2xl cursor-pointer transition-all duration-300 hover:border-[#F28C38] hover:bg-[#F28C38]/10">
                                {imagePreview ? (
                                    <div className="relative h-full rounded-2xl overflow-hidden">
                                        <img src={imagePreview} alt="Food preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity duration-300">
                                            <span className="font-medium">{t('addFood.upload.change')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center h-full text-gray-500">
                                        <svg className="w-12 h-12 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 9a2 2 0 012-2h6l3 3h4a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"></path>
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"></path>
                                        </svg>
                                        <h4 className="text-lg font-medium text-gray-700">{t('addFood.upload.cta')}</h4>
                                        <p className="text-sm">{t('addFood.upload.ctaSub')}</p>
                                    </div>
                                )}
                            </label>
                        </div>

                        {/* Step 2: Food Details */}
                        <div className="mb-12">
                            <div className="flex items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800">{t('addFood.sections.details')}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="quantity" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.quantity')}</label>
                                    <input 
                                        type="number" 
                                        id="quantity"
                                        name="quantity" 
                                        value={quantity} 
                                        onChange={onChange}
                                        placeholder={t('addFood.placeholders.quantity')}
                                        min="1"
                                        required 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="foodType" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.foodType')}</label>
                                    <select 
                                        id="foodType" 
                                        name="foodType" 
                                        value={foodType} 
                                        onChange={onChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    >
                                        <option value="cooked_meal">{t('addFood.options.foodType.cooked')}</option>
                                        <option value="dairy_sweets">{t('addFood.options.foodType.dairy')}</option>
                                        <option value="fried_snacks">{t('addFood.options.foodType.snacks')}</option>
                                        <option value="baked_goods">{t('addFood.options.foodType.baked')}</option>
                                        <option value="cut_fruits">{t('addFood.options.foodType.fruits')}</option>
                                        <option value="beverages">{t('addFood.options.foodType.beverages')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="storageCondition" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.storage')}</label>
                                    <select 
                                        id="storageCondition" 
                                        name="storageCondition" 
                                        value={storageCondition} 
                                        onChange={onChange}
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    >
                                        <option value="Covered Room Temp">{t('addFood.options.storage.covered')}</option>
                                        <option value="Uncovered Room Temp">{t('addFood.options.storage.uncovered')}</option>
                                        <option value="Refrigerated">{t('addFood.options.storage.refrigerated')}</option>
                                        <option value="Frozen">{t('addFood.options.storage.frozen')}</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="preparationTime" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.prepTime')}</label>
                                    <input 
                                        type="datetime-local" 
                                        id="preparationTime"
                                        name="preparationTime" 
                                        value={preparationTime} 
                                        onChange={onChange} 
                                        required 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Step 3: AI Analysis */}
                        <div className="mb-12 bg-[#1A3C34]/10 p-6 rounded-2xl">
                            <div className="flex items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800">{t('addFood.sections.ai')}</h3>
                            </div>
                            <p className="text-gray-600 mb-6 text-center">{t('addFood.ai.description')}</p>
                            <button 
                                type="button" 
                                onClick={handleAnalyze} 
                                disabled={isAnalyzeDisabled}
                                className="w-full sm:w-auto px-8 py-3 bg-[#F28C38] text-white rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-[#FF6F61] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        {t('addFood.ai.buttonLoading')}
                                    </>
                                ) : (
                                    t('addFood.ai.button')
                                )}
                            </button>
                        </div>

                        {/* Step 4: Final Details */}
                        <div className="mb-12">
                            <div className="flex items-center mb-6">
                                <h3 className="text-2xl font-semibold text-gray-800">{t('addFood.sections.confirm')}</h3>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.foodTitle')}</label>
                                    <input 
                                        type="text" 
                                        id="title"
                                        name="title" 
                                        value={title} 
                                        onChange={onChange} 
                                        placeholder={t('addFood.placeholders.title')}
                                        required 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    />
                                </div>
                                <div>
                                    <label htmlFor="source" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.source')}</label>
                                    <input 
                                        type="text" 
                                        id="source"
                                        name="source" 
                                        value={source} 
                                        onChange={onChange} 
                                        placeholder={t('addFood.placeholders.source')}
                                        required 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    />
                                </div>
                                <div className="col-span-1 sm:col-span-2">
                                    <label htmlFor="expiresAt" className="block text-sm font-medium text-gray-700 mb-2">{t('addFood.labels.expiresAt')}</label>
                                    <input 
                                        type="datetime-local" 
                                        id="expiresAt"
                                        name="expiresAt" 
                                        value={expiresAt} 
                                        onChange={onChange} 
                                        required 
                                        className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F28C38] focus:border-transparent transition-all duration-300 bg-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 text-red-600 p-4 rounded-xl mb-6 flex items-center gap-3">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                                </svg>
                                {error}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSubmitting || isAnalyzing}
                            className="w-full py-4 bg-[#F28C38] text-white rounded-xl font-semibold text-lg flex items-center justify-center gap-2 hover:bg-[#FF6F61] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? (
                                <>
                                    <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('addFood.submitButton.creating')}
                                </>
                            ) : (
                                t('addFood.submitButton.create')
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default AddFoodPage;