import React, { useState } from 'react';
import { useFood } from '../context/FoodContext';
import { useNavigate } from 'react-router-dom';
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
            setError("Sorry, the AI analysis failed. Please check the details and try again, or set the fields manually.");
        } finally {
            setIsAnalyzing(false);
        }
    };

    const onSubmit = async e => {
        e.preventDefault();
        if (!imageFile) {
            alert("Please upload an image for the food listing.");
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
                setError('Failed to add food listing. Please check the details and try again.');
            }
        } catch (err) {
            console.error("Error creating food listing:", err);
            setError("Failed to upload image or create listing. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const isAnalyzeDisabled = !imageFile || !quantity || !foodType || !storageCondition || !preparationTime || isAnalyzing || isSubmitting;

    const progressSteps = [
        { number: 1, title: "Upload Photo", active: currentStep >= 1 },
        { number: 2, title: "Food Details", active: currentStep >= 2 },
        { number: 3, title: "AI Analysis", active: currentStep >= 3 },
        { number: 4, title: "Final Review", active: currentStep >= 4 }
    ];

    return (
        <div className="add-food-page">
            <div className="container">
                <div className="header">
                    <h1>List Surplus Food</h1>
                    <p>Help reduce food waste by sharing your surplus food with others</p>
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
                            <h3>Upload Food Photo</h3>
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
                                            <span>Click to change photo</span>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="upload-placeholder">
                                        <div className="upload-icon">📷</div>
                                        <h4>Click to upload food photo</h4>
                                        <p>PNG, JPG up to 10MB</p>
                                    </div>
                                )}
                            </label>
                        </div>
                    </div>

                    {/* Step 2: Food Details */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="step-badge">2</div>
                            <h3>Enter Food Details</h3>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="quantity">Available Portions</label>
                                <input 
                                    type="number" 
                                    id="quantity"
                                    name="quantity" 
                                    value={quantity} 
                                    onChange={onChange}
                                    placeholder="e.g., 4"
                                    min="1"
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="foodType">Food Category</label>
                                <select id="foodType" name="foodType" value={foodType} onChange={onChange}>
                                    <option value="cooked_meal">🍛 Cooked Meal (Rice, Curry)</option>
                                    <option value="dairy_sweets">🍰 Dairy / Sweets</option>
                                    <option value="fried_snacks">🍟 Fried Snacks</option>
                                    <option value="baked_goods">🥖 Baked Goods (Bread, Puffs)</option>
                                    <option value="cut_fruits">🥗 Salads & Cut Fruits</option>
                                    <option value="beverages">🥤 Beverages</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="storageCondition">Storage Condition</label>
                                <select id="storageCondition" name="storageCondition" value={storageCondition} onChange={onChange}>
                                    <option value="Covered Room Temp">🛡️ Covered (Room Temp)</option>
                                    <option value="Uncovered Room Temp">⚠️ Uncovered (Room Temp)</option>
                                    <option value="Refrigerated">❄️ Refrigerated</option>
                                    <option value="Frozen">🧊 Frozen</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="preparationTime">Preparation Time</label>
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
                            <h3>AI Analysis (Optional)</h3>
                        </div>
                        <div className="ai-content">
                            <p>Let our AI analyze your food photo and details to suggest an optimal title and expiry time.</p>
                            <button 
                                type="button" 
                                onClick={handleAnalyze} 
                                disabled={isAnalyzeDisabled}
                                className="ai-analyze-btn"
                            >
                                {isAnalyzing ? (
                                    <>
                                        <span className="loading-spinner"></span>
                                        Analyzing...
                                    </>
                                ) : (
                                    <>
                                        ✨ Analyze with AI
                                    </>
                                )}
                            </button>
                        </div>
                    </div>

                    {/* Step 4: Final Details */}
                    <div className="form-section">
                        <div className="section-header">
                            <div className="step-badge">4</div>
                            <h3>Confirm Details</h3>
                        </div>
                        
                        <div className="form-grid">
                            <div className="form-group">
                                <label htmlFor="title">Food Title</label>
                                <input 
                                    type="text" 
                                    id="title"
                                    name="title" 
                                    value={title} 
                                    onChange={onChange} 
                                    placeholder="e.g., Vegetable Curry"
                                    required 
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="source">Source/Location</label>
                                <input 
                                    type="text" 
                                    id="source"
                                    name="source" 
                                    value={source} 
                                    onChange={onChange} 
                                    placeholder="e.g., Main Canteen"
                                    required 
                                />
                            </div>

                            <div className="form-group full-width">
                                <label htmlFor="expiresAt">Expires At</label>
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
                                Creating Listing...
                            </>
                        ) : (
                            'Create Food Listing'
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AddFoodPage;