import React, { useState, useContext } from 'react';
import { useFood } from '../context/FoodContext';
import { useNavigate } from 'react-router-dom';
import api from '../services/api'; // Import the api instance for uploading

// --- Helper function to convert an image file to Base64 ---
const toBase64 = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result.split(',')[1]); // Get only the Base64 part
    reader.onerror = error => reject(error);
});

// --- Helper function to format a Date object to a local datetime string ---
const formatLocalDate = (date) => {
    const pad = (num) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1); // getMonth() is zero-based
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
    foodType: 'cooked_meal', // Default to the value from your old form
    storageCondition: 'Refrigerated', // A safe default
    preparationTime: formatLocalDate(new Date()),
    expiresAt: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const { title, source, quantity, foodType, storageCondition, preparationTime, expiresAt } = formData;

  const onChange = e => setFormData({ ...formData, [e.target.name]: e.target.value });

  const onFileChange = e => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAnalyze = async () => {
    setIsAnalyzing(true);
    setError('');

    try {
      const base64ImageData = await toBase64(imageFile);
      
      // --- FIX: Updated the prompt to be even more explicit about the output format ---
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

      // --- FIX: Removed the complex generationConfig to prevent the 400 error ---
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
      
      const apiKey = "AIzaSyDSLbrH5iFO3bDXAsuVjgntHzDl6IPhjfs"; // <-- PASTE YOUR KEY HERE
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

  return (
    <div className="add-food-container">
      <h1>List Surplus Food</h1>
      <form onSubmit={onSubmit}>
        <div className="image-upload-section">
          <label>1. Upload Food Photo</label>
          <div className="image-uploader">
            <input type="file" onChange={onFileChange} accept="image/*" id="file-upload" />
            <label htmlFor="file-upload" className="upload-label">
              {imagePreview ? <img src={imagePreview} alt="Food preview" /> : <span>Click to Upload</span>}
            </label>
          </div>
        </div>

        {/* Form Fields */}
        <label>2. Enter Food Details</label>
        <input type="number" name="quantity" value={quantity} onChange={onChange} placeholder="Available Portions" required />
        
        <select name="foodType" value={foodType} onChange={onChange}>
          <option value="cooked_meal">Cooked Meal (Rice, Curry)</option>
          <option value="dairy_sweets">Dairy / Sweets</option>
          <option value="fried_snacks">Fried Snacks</option>
          <option value="baked_goods">Baked Goods (Bread, Puffs)</option>
          <option value="cut_fruits">Salads & Cut Fruits</option>
          <option value="beverages">Beverages</option>
        </select>
        
        <select name="storageCondition" value={storageCondition} onChange={onChange}>
          <option value="Covered Room Temp">Covered (Room Temp)</option>
          <option value="Uncovered Room Temp">Uncovered (Room Temp)</option>
          <option value="Refrigerated">Refrigerated</option>
          <option value="Frozen">Frozen</option>
        </select>
        
        <input type="datetime-local" name="preparationTime" value={preparationTime} onChange={onChange} required />
        
        <div className="ai-section">
            <label>3. Get AI Suggestions (Optional)</label>
            <button type="button" onClick={handleAnalyze} disabled={isAnalyzeDisabled}>
                {isAnalyzing ? 'Analyzing...' : '✨ Analyze Freshness & Title with AI'}
            </button>
        </div>

        <label>4. Confirm Details</label>
        <input type="text" name="title" value={title} onChange={onChange} placeholder="Food Title (e.g., Vegetable Curry)" required />
        <input type="text" name="source" value={source} onChange={onChange} placeholder="Source (e.g., Main Canteen)" required />
        <input type="datetime-local" name="expiresAt" value={expiresAt} onChange={onChange} required />

        {error && <p className="error-message">{error}</p>}
        <button type="submit" disabled={isSubmitting || isAnalyzing}>
            {isSubmitting ? 'Listing Food...' : 'Add Food Listing'}
        </button>
      </form>
      <style jsx>{`
        .add-food-container { max-width: 600px; margin: 2rem auto; padding: 2rem; background: #fff; border-radius: 15px; box-shadow: 0 8px 30px rgba(0,0,0,0.1); }
        h1 { text-align: center; color: #2E7D32; }
        form { display: flex; flex-direction: column; gap: 1rem; }
        input, select { padding: 12px; border: 1px solid #ccc; border-radius: 8px; font-size: 1rem; }
        label { font-weight: 600; color: #333; margin-top: 0.5rem; }
        button { padding: 15px; border: none; border-radius: 8px; background-color: #4CAF50; color: white; font-size: 1.1rem; cursor: pointer; transition: background-color 0.3s; }
        button:hover { background-color: #45a049; }
        .ai-section button { background-color: #FF9800; }
        .ai-section button:hover { background-color: #fb8c00; }
        button:disabled { background-color: #ccc; cursor: not-allowed; }
        .error-message { color: red; text-align: center; }

        .image-upload-section, .ai-section { text-align: center; margin-bottom: 1rem; border: 1px solid #eee; padding: 1rem; border-radius: 10px; }
        .image-uploader input[type="file"] { display: none; }
        .upload-label { border: 2px dashed #ccc; border-radius: 10px; padding: 1rem; display: block; cursor: pointer; height: 150px; display: flex; align-items: center; justify-content: center; }
        .upload-label img { max-width: 100%; max-height: 100%; border-radius: 5px; }
        .upload-label:hover { border-color: #4CAF50; }
      `}</style>
    </div>
  );
};

export default AddFoodPage;
