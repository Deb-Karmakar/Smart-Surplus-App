import React, { useState } from 'react';
import { useFood } from '../context/FoodContext';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import api from '../services/api';
import './AddFoodPage.css';

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
        <div className="add-food-page">
            <div className="container">
                <div className="header">
                    <h1>{t('addFood.title')}</h1>
                    <p>{t('addFood.subtitle')}</p>
                </div>

                <div className="progress-bar">
                    {progressSteps.map((step, index) => (
                        <div key={step.number} className={`progress-step ${step.active ? 'active' : ''}`}>
                            <div className="step-number">{step.number}</div>
                            <span className="step-title">{step.title}</span>
                            {index < progressSteps.length - 1 && <div className="step-connector"></div>}
                        </div>
                    ))}
                </div>

                <form onSubmit={onSubmit} className="food-form">
                    {/* Step 1: Image Upload */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="step-badge">1</div>
                            <h3>{t('addFood.sections.upload')}</h3>
                        </div>
                        <div className="image-upload-container">
                            <input 
                                type="file" 
                                onChange={onFileChange} 
                                accept="image/*" 
                                id="file-upload"
                                className="file-input"
                            />
                            <label htmlFor="file-upload" className="upload-area">
                                {imagePreview ? (
                                    <div className="image-preview">
                                        <img src={imagePreview} alt="Food preview" />
                                        <div className="image-overlay">
                                            <span>{t('addFood.upload.change')}</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="upload-icon">📷</div>
                                        <h4>{t('addFood.upload.cta')}</h4>
                                        <p>{t('addFood.upload.ctaSub')}</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Step 2: Food Details */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="step-badge">2</div>
                            <h3>{t('addFood.sections.details')}</h3>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="quantity">{t('addFood.labels.quantity')}</label>
                                <input 
                                    type="number" 
                                    id="quantity"
                                    name="quantity" 
                                    value={quantity} 
                                    onChange={onChange}
                                    placeholder={t('addFood.placeholders.quantity')}
                                    min="1"
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="foodType">{t('addFood.labels.foodType')}</label>
                                <select id="foodType" name="foodType" value={foodType} onChange={onChange}>
                                    <option value="cooked_meal">{t('addFood.options.foodType.cooked')}</option>
                                    <option value="dairy_sweets">{t('addFood.options.foodType.dairy')}</option>
                                    <option value="fried_snacks">{t('addFood.options.foodType.snacks')}</option>
                                    <option value="baked_goods">{t('addFood.options.foodType.baked')}</option>
                                    <option value="cut_fruits">{t('addFood.options.foodType.fruits')}</option>
                                    <option value="beverages">{t('addFood.options.foodType.beverages')}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="storageCondition">{t('addFood.labels.storage')}</label>
                                <select id="storageCondition" name="storageCondition" value={storageCondition} onChange={onChange}>
                                    <option value="Covered Room Temp">{t('addFood.options.storage.covered')}</option>
                                    <option value="Uncovered Room Temp">{t('addFood.options.storage.uncovered')}</option>
                                    <option value="Refrigerated">{t('addFood.options.storage.refrigerated')}</option>
                                    <option value="Frozen">{t('addFood.options.storage.frozen')}</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="preparationTime">{t('addFood.labels.prepTime')}</label>
                                <input 
                                    type="datetime-local" 
                                    id="preparationTime"
                                    name="preparationTime" 
                                    value={preparationTime} 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {/* Step 3: AI Analysis */}
                    <div className="form-section ai-section">
                        <div className="section-header">
                            <div className="step-badge">3</div>
                            <h3>{t('addFood.sections.ai')}</h3>
                        </div>
                        <div className="ai-content">
                            <p>{t('addFood.ai.description')}</p>
                            <button 
                                type="button" 
                                onClick={handleAnalyze} 
                                disabled={isAnalyzeDisabled}
                                className="ai-analyze-btn"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        {t('addFood.ai.buttonLoading')}
                                    </>
                                ) : (
                                    <>
                                        {t('addFood.ai.button')}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Step 4: Final Details */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="step-badge">4</div>
                            <h3>{t('addFood.sections.confirm')}</h3>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="title">{t('addFood.labels.foodTitle')}</label>
                                <input 
                                    type="text" 
                                    id="title"
                                    name="title" 
                                    value={title} 
                                    onChange={onChange} 
                                    placeholder={t('addFood.placeholders.title')}
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="source">{t('addFood.labels.source')}</label>
                                <input 
                                    type="text" 
                                    id="source"
                                    name="source" 
                                    value={source} 
                                    onChange={onChange} 
                                    placeholder={t('addFood.placeholders.source')}
                                    required 
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="expiresAt">{t('addFood.labels.expiresAt')}</label>
                                <input 
                                    type="datetime-local" 
                                    id="expiresAt"
                                    name="expiresAt" 
                                    value={expiresAt} 
                                    onChange={onChange} 
                                    required 
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="error-message">
                            <span className="error-icon">⚠️</span>
                            {error}
                        </div>
                    )}

                    <button 
                        type="submit" 
                        disabled={isSubmitting || isAnalyzing}
                        className="submit-btn"
                    >
                        {isSubmitting ? (
                            <>
                                <span className="loading-spinner"></span>
                                {t('addFood.submitButton.creating')}
                            </>
                        ) : (
                            t('addFood.submitButton.create')
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddFoodPage;