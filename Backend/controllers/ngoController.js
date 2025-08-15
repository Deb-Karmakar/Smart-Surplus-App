const axios = require('axios');

// @desc    Find nearby NGOs using Google Places API
exports.findNearbyNGOs = async (req, res) => {
  const { lat, lng, radius } = req.query; // <-- Get radius from query

  if (!lat || !lng) {
    return res.status(400).json({ msg: 'Latitude and longitude are required.' });
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    console.error("CRITICAL: GOOGLE_MAPS_API_KEY is not set in .env file.");
    return res.status(500).send('Server configuration error.');
  }

  const keyword = 'NGO food charity'; // A broad and effective keyword
  let url;

  // --- UPDATED: Build the URL based on the selected radius ---
  if (radius && radius !== 'any') {
    // If a specific radius is provided (e.g., 5000, 10000, 20000)
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
  } else {
    // If radius is 'any' (for >20km), rank by distance
    url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&rankby=distance&keyword=${encodeURIComponent(keyword)}&key=${apiKey}`;
  }

  console.log("Calling Google Maps API with URL:", url);

  try {
    const response = await axios.get(url);
    
    console.log("Google Maps API Response Status:", response.data.status);
    console.log("Google Maps API Results Count:", response.data.results.length);

    if (response.data.status !== 'OK' && response.data.status !== 'ZERO_RESULTS') {
        console.error("Google Maps API Error:", response.data.error_message || response.data.status);
        return res.status(500).json({ msg: `Google API Error: ${response.data.status}` });
    }

    const formattedResults = response.data.results.map(place => ({
        id: place.place_id,
        name: place.name,
        address: place.vicinity,
    }));

    res.json(formattedResults);
  } catch (err) {
    console.error('Axios Error during Google Maps API call:', err.message);
    res.status(500).send('Server Error');
  }
};
