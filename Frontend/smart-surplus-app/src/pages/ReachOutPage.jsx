import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { MapPin, Phone, Mail, Navigation, Search, AlertCircle, CheckCircle, Loader, RefreshCw, Settings } from 'lucide-react';
import api from '../services/api';

// Helper function to calculate accuracy percentage
const calculateAccuracyPercentage = (accuracy) => {
    if (!accuracy || accuracy === 0) return 100;
    if (accuracy <= 5) return 95;
    if (accuracy <= 10) return 85;
    if (accuracy <= 20) return 75;
    if (accuracy <= 50) return 60;
    if (accuracy <= 100) return 45;
    return 30;
};

// Helper function for Reverse Geocoding
const reverseGeocode = async (lat, lng) => {
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=16&addressdetails=1`, { headers: { 'User-Agent': 'ZeroBiteApp/1.0' } });
        if (!response.ok) throw new Error('Geocoding service unavailable');
        const data = await response.json();
        return data?.display_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    } catch {
        return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
    }
};

// Helper function for Forward Geocoding
const geocodeAddress = async (address) => {
    const fetchLocation = async (query) => {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&countrycodes=in&q=${encodeURIComponent(query)}&limit=1&addressdetails=1`, { headers: { 'User-Agent': 'ZeroBiteApp/1.0' } });
        if (!response.ok) throw new Error('Geocoding service unavailable');
        return await response.json();
    };
    let data = await fetchLocation(address);
    if (!data.length) {
        const simplified = address.replace(/\d{6}|\d{5}/g, '').split(',').slice(-3).join(',');
        data = await fetchLocation(simplified);
    }
    if (data?.length) {
        return { latitude: parseFloat(data[0].lat), longitude: parseFloat(data[0].lon), formatted_address: data[0].display_name };
    }
    throw new Error('Address not found');
};

// NGO Card Component
const NGOCard = ({ ngo }) => {
    const { t } = useTranslation();
    return (
        <div className="ngo-card">
            <div className="ngo-header">
                <div className="ngo-icon"><div className="icon-circle"><span className="hands-icon">🤝</span></div></div>
                <div className="ngo-info">
                    <h3 className="ngo-name">{ngo.name}</h3>
                    <p className="ngo-address"><MapPin size={14} className="address-icon" />{ngo.address}</p>
                    {ngo.description && <p className="ngo-description">{ngo.description}</p>}
                    {ngo.distance && <p className="ngo-distance">📍 {t('reachOutPage.ngoCard.distanceAway', { distance: ngo.distance })}</p>}
                </div>
            </div>
            <div className="ngo-actions">
                {ngo.phone && (<button onClick={() => window.open(`tel:${ngo.phone}`, '_self')} className="action-btn call-btn"><Phone size={16} /><span>{t('reachOutPage.ngoCard.call')}</span></button>)}
                {ngo.email && (<button onClick={() => window.open(`mailto:${ngo.email}`, '_self')} className="action-btn email-btn"><Mail size={16} /><span>{t('reachOutPage.ngoCard.email')}</span></button>)}
                <button onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(ngo.name + ', ' + ngo.address)}`, '_blank')} className="action-btn map-btn"><MapPin size={16} /><span>{t('reachOutPage.ngoCard.map')}</span></button>
            </div>
        </div>
    );
};

const ReachOutPage = () => {
    const { t } = useTranslation();
    const [ngos, setNgos] = useState([]);
    const [status, setStatus] = useState('idle');
    const [error, setError] = useState('');
    const [location, setLocation] = useState(null);
    const [locationAddress, setLocationAddress] = useState('');
    const [radius, setRadius] = useState(10000);
    const [manualAddress, setManualAddress] = useState('');
    const [showManualInput, setShowManualInput] = useState(false);
    const [isGeocoding, setIsGeocoding] = useState(false);
    const [manualMode, setManualMode] = useState(false);

    const findNearbyNGOs = useCallback(async () => {
        if (!location) return;
        setStatus('loading');
        setError('');
        try {
            const { latitude, longitude } = location.coords;
            const res = await api.get(`/ngo/nearby?lat=${latitude}&lng=${longitude}&radius=${radius}`);
            setNgos(res.data);
            setStatus('success');
        } catch {
            setError(t('reachOutPage.location.errorFetch'));
            setStatus('error');
        }
    }, [location, radius, t]);

    const requestLocation = useCallback(async () => {
        setManualMode(false);
        setStatus('loading');
        setError('');
        setLocationAddress(t('reachOutPage.location.getting'));
        navigator.geolocation.getCurrentPosition(
            async (pos) => {
                setLocation(pos);
                setLocationAddress(await reverseGeocode(pos.coords.latitude, pos.coords.longitude));
                setStatus('idle');
            },
            () => {
                setError(t('reachOutPage.location.error'));
                setStatus('error');
            },
            { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
        );
    }, [t]);

    const handleUseManualAddress = async () => {
        if (!manualAddress.trim()) {
            setError(t('reachOutPage.manualInput.error'));
            return;
        }
        setIsGeocoding(true);
        setError('');
        try {
            const result = await geocodeAddress(manualAddress.trim());
            const manualPos = { coords: { latitude: result.latitude, longitude: result.longitude, accuracy: 0 }, timestamp: Date.now() };
            setLocation(manualPos);
            setLocationAddress(result.formatted_address);
            setShowManualInput(false);
            setManualAddress('');
            setManualMode(true);
        } catch (error) {
            setError(error.message);
        } finally {
            setIsGeocoding(false);
        }
    };

    useEffect(() => {
        if (!manualMode && !location) {
            requestLocation();
        }
    }, [manualMode, location, requestLocation]);

    useEffect(() => {
        if (location) {
            findNearbyNGOs();
        }
    }, [location, findNearbyNGOs]);

    const accuracyPercentage = location ? calculateAccuracyPercentage(location.coords.accuracy) : 0;
    
    // --- RENDER FUNCTIONS ---
    const renderLocationStatus = () => {
        const isGettingLocation = status === 'loading' || locationAddress === t('reachOutPage.location.getting') || locationAddress === t('reachOutPage.location.converting');

        if (!location && !locationAddress && status !== 'loading') return null;
        
        return (
            <div className="location-status">
                <div className="location-info">
                    {location && locationAddress && !isGettingLocation ? (
                        <>
                            <CheckCircle size={16} className="status-icon success" />
                            <div className="location-details">
                                <span className="location-text">📍 {locationAddress}</span>
                                <div className="accuracy-info">
                                    <span className="accuracy-badge">{t('reachOutPage.location.accurate', { percent: accuracyPercentage })}</span>
                                    {location.coords.accuracy > 0 && <span className="accuracy-meters">(±{Math.round(location.coords.accuracy)}m)</span>}
                                </div>
                            </div>
                        </>
                    ) : (isGettingLocation) ? (
                        <>
                            <Loader size={16} className="status-icon loading" />
                            <span className="location-text">{locationAddress || t('reachOutPage.location.getting')}</span>
                        </>
                    ) : null}
                </div>
            </div>
        );
    };

    const renderContent = () => {
        if (status === 'loading' && ngos.length === 0) {
            return (
                <div className="status-container"><div className="status-content loading">
                    <Loader size={48} className="status-loader" />
                    <h3>{t('reachOutPage.status.loadingTitle')}</h3>
                    <p>{t('reachOutPage.status.loadingSubtitle')}</p>
                </div></div>
            );
        }
        if (status === 'error') {
            return (
                <div className="status-container"><div className="status-content error">
                    <AlertCircle size={48} className="status-icon" />
                    <h3>{t('reachOutPage.status.errorTitle')}</h3>
                    <p>{error}</p>
                    <div className="error-actions">
                        <button onClick={requestLocation} className="retry-btn"><RefreshCw size={16} />{t('reachOutPage.status.tryAgain')}</button>
                        <button onClick={() => setShowManualInput(!showManualInput)} className="manual-btn"><Settings size={16} />{t('reachOutPage.status.manual')}</button>
                    </div>
                </div></div>
            );
        }
        if (status === 'success') {
            return ngos.length ? (
                <div className="results-container">
                    <div className="results-header">
                        <Search size={20} />
                        <span>{t(ngos.length > 1 ? 'reachOutPage.status.success_plural' : 'reachOutPage.status.success', { count: ngos.length })}</span>
                    </div>
                    <div className="ngo-grid">{ngos.map(ngo => <NGOCard key={ngo._id || ngo.id} ngo={ngo} />)}</div>
                </div>
            ) : (
                <div className="status-container"><div className="status-content empty">
                    <Search size={48} className="status-icon" />
                    <h3>{t('reachOutPage.status.emptyTitle')}</h3>
                    <p>{radius === 'any' ? t('reachOutPage.status.emptySubtitleAny') : t('reachOutPage.status.emptySubtitle', { distance: `${radius/1000}km` })}</p>
                    <button onClick={() => setRadius(radius < 20000 ? radius * 2 : 'any')} className="expand-btn">{t('reachOutPage.status.expand')}</button>
                </div></div>
            );
        }
        return null;
    };

    return (
        <>
            <div className="reach-out-container">
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">{t('reachOutPage.title')}</h1>
                        <p className="page-subtitle">{t('reachOutPage.subtitle')}</p>
                    </div>
                    {/* RESTORED THIS FUNCTION CALL */}
                    {renderLocationStatus()}
                </div>
                <div className="controls-section">
                    <div className="radius-filter">
                        <span className="filter-label">{t('reachOutPage.controls.radius')}</span>
                        <div className="radius-buttons">
                            <button onClick={() => setRadius(5000)} className={`radius-btn ${radius === 5000 ? 'active' : ''}`}>5 km</button>
                            <button onClick={() => setRadius(10000)} className={`radius-btn ${radius === 10000 ? 'active' : ''}`}>10 km</button>
                            <button onClick={() => setRadius(20000)} className={`radius-btn ${radius === 20000 ? 'active' : ''}`}>20 km</button>
                            <button onClick={() => setRadius('any')} className={`radius-btn ${radius === 'any' ? 'active' : ''}`}>{t('reachOutPage.controls.anyDistance')}</button>
                        </div>
                    </div>
                    <div className="action-controls">
                        <button onClick={requestLocation} className="control-btn primary"><Navigation size={16} />{t('reachOutPage.controls.refresh')}</button>
                        <button onClick={() => setShowManualInput(!showManualInput)} className="control-btn secondary"><Settings size={16} />{t('reachOutPage.controls.enterAddress')}</button>
                    </div>
                    {showManualInput && (
                        <div className="manual-input-section">
                            <div className="manual-inputs">
                                <div className="input-group">
                                    <label>{t('reachOutPage.manualInput.label')}</label>
                                    <input type="text" placeholder={t('reachOutPage.manualInput.placeholder')} value={manualAddress} onChange={e => setManualAddress(e.target.value)} className="address-input" onKeyPress={(e) => { if (e.key === 'Enter') { handleUseManualAddress(); }}} />
                                </div>
                                <button onClick={handleUseManualAddress} className="use-address-btn" disabled={isGeocoding || !manualAddress.trim()}>
                                    {isGeocoding ? <><Loader size={16} className="loading-spinner" />{t('reachOutPage.manualInput.buttonLoading')}</> : <><Search size={16} />{t('reachOutPage.manualInput.button')}</>}
                                </button>
                            </div>
                            <p className="address-hint">{t('reachOutPage.manualInput.hint')}</p>
                        </div>
                    )}
                </div>
                {renderContent()}
            </div>

      <style jsx>{`
        .reach-out-container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 24px;
          background: linear-gradient(135deg, #f8fffe 0%, #f0fdf4 100%);
          min-height: 100vh;
        }

        .page-header {
          text-align: center;
          margin-bottom: 32px;
          background: white;
          border-radius: 20px;
          padding: 32px;
          box-shadow: 0 4px 20px rgba(0,0,0,0.08);
          border: 1px solid rgba(44, 94, 74, 0.1);
        }

        .header-content {
          margin-bottom: 20px;
        }

        .page-title {
          font-size: 2.5rem;
          font-weight: 700;
          color: #2C5E4A;
          margin: 0 0 12px 0;
          background: linear-gradient(135deg, #2C5E4A 0%, #16a085 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .page-subtitle {
          font-size: 1.1rem;
          color: #6b7280;
          margin: 0;
          max-width: 600px;
          margin: 0 auto;
          line-height: 1.6;
        }

        .location-status {
          margin-top: 20px;
          padding: 16px;
          background: #f0fdf4;
          border-radius: 12px;
          border: 1px solid #bbf7d0;
        }

        .location-info {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .status-icon.success {
          color: #16a085;
          flex-shrink: 0;
        }

        .status-icon.loading {
          color: #2C5E4A;
          animation: spin 1s linear infinite;
          flex-shrink: 0;
        }

        .location-details {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
        }

        .location-text {
          font-size: 0.95rem;
          color: #374151;
          font-weight: 500;
          max-width: 400px;
          word-break: break-word;
          text-align: center;
        }

        .accuracy-info {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .accuracy-badge {
          background: #16a085;
          color: white;
          padding: 2px 8px;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .accuracy-meters {
          font-size: 0.75rem;
          color: #6b7280;
        }

        .controls-section {
          background: white;
          border-radius: 16px;
          padding: 24px;
          margin-bottom: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(44, 94, 74, 0.1);
        }

        .radius-filter {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 16px;
          margin-bottom: 20px;
        }

        .filter-label {
          font-weight: 600;
          color: #374151;
          font-size: 0.95rem;
        }

        .radius-buttons {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          justify-content: center;
        }

        .radius-btn {
          padding: 10px 20px;
          border: 2px solid #e5e7eb;
          background: white;
          color: #6b7280;
          border-radius: 25px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .radius-btn:hover {
          border-color: #2C5E4A;
          color: #2C5E4A;
        }

        .radius-btn.active {
          background: #2C5E4A;
          border-color: #2C5E4A;
          color: white;
        }

        .action-controls {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .control-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border-radius: 12px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
          border: none;
        }

        .control-btn.primary {
          background: #2C5E4A;
          color: white;
        }

        .control-btn.primary:hover {
          background: #1e4037;
        }

        .control-btn.secondary {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .control-btn.secondary:hover {
          background: #e5e7eb;
        }

        .manual-input-section {
          margin-top: 20px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
        }

        .manual-inputs {
          display: flex;
          flex-direction: column;
          align-items: stretch;
          gap: 16px;
          margin-bottom: 12px;
        }

        .input-group {
          display: flex;
          flex-direction: column;
          gap: 6px;
          width: 100%;
        }

        .input-group label {
          font-size: 0.85rem;
          font-weight: 500;
          color: #374151;
        }

        .address-input {
          padding: 12px 16px;
          border: 2px solid #e5e7eb;
          border-radius: 10px;
          font-size: 0.95rem;
          transition: border-color 0.2s ease;
          width: 100%;
        }

        .address-input:focus {
          outline: none;
          border-color: #2C5E4A;
        }

        .address-input::placeholder {
          color: #9ca3af;
        }

        .use-address-btn {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 20px;
          background: #16a085;
          color: white;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          font-size: 0.9rem;
          transition: background-color 0.2s ease;
          width: 100%;
          margin-top: 4px;
        }

        .use-address-btn:hover:not(:disabled) {
          background: #138a73;
        }

        .use-address-btn:disabled {
          background: #9ca3af;
          cursor: not-allowed;
        }

        .loading-spinner {
          animation: spin 1s linear infinite;
        }

        .address-hint {
          text-align: center;
          font-size: 0.85rem;
          color: #6b7280;
          margin: 0;
          font-style: italic;
        }

        .status-container {
          background: white;
          border-radius: 16px;
          padding: 48px 24px;
          text-align: center;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(44, 94, 74, 0.1);
        }

        .status-content {
          max-width: 400px;
          margin: 0 auto;
        }

        .status-content h3 {
          font-size: 1.5rem;
          margin: 16px 0 8px 0;
          color: #2C5E4A;
        }

        .status-content p {
          color: #6b7280;
          line-height: 1.6;
          margin-bottom: 24px;
        }

        .status-loader {
          color: #2C5E4A;
          animation: spin 1s linear infinite;
        }

        .status-content.error .status-icon {
          color: #dc2626;
        }

        .status-content.empty .status-icon {
          color: #6b7280;
        }

        .error-actions, .retry-btn, .expand-btn {
          display: flex;
          justify-content: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .retry-btn, .manual-btn, .expand-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 12px 20px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s ease;
        }

        .retry-btn {
          background: #2C5E4A;
          color: white;
        }

        .retry-btn:hover {
          background: #1e4037;
        }

        .manual-btn, .expand-btn {
          background: #f3f4f6;
          color: #374151;
          border: 1px solid #d1d5db;
        }

        .manual-btn:hover, .expand-btn:hover {
          background: #e5e7eb;
        }

        .results-container {
          background: white;
          border-radius: 16px;
          padding: 24px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
          border: 1px solid rgba(44, 94, 74, 0.1);
        }

        .results-header {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid #e5e7eb;
          font-weight: 600;
          color: #2C5E4A;
        }

        .ngo-grid {
          display: grid;
          gap: 20px;
        }

        .ngo-card {
          background: #fafafa;
          border: 1px solid #e5e7eb;
          border-radius: 16px;
          padding: 24px;
          transition: all 0.2s ease;
          hover: transform: translateY(-2px);
        }

        .ngo-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0,0,0,0.1);
          border-color: #2C5E4A;
        }

        .ngo-header {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
        }

        .ngo-icon {
          flex-shrink: 0;
        }

        .icon-circle {
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background: linear-gradient(135deg, #2C5E4A 0%, #16a085 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .ngo-info {
          flex: 1;
        }

        .ngo-name {
          font-size: 1.25rem;
          font-weight: 700;
          color: #2C5E4A;
          margin: 0 0 8px 0;
        }

        .ngo-address {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #6b7280;
          margin: 0 0 8px 0;
          font-size: 0.9rem;
        }

        .address-icon {
          color: #16a085;
          flex-shrink: 0;
        }

        .ngo-description {
          color: #4b5563;
          font-size: 0.9rem;
          line-height: 1.5;
          margin: 8px 0;
        }

        .ngo-distance {
          color: #16a085;
          font-size: 0.85rem;
          font-weight: 500;
          margin: 4px 0 0 0;
        }

        .ngo-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
          flex-wrap: wrap;
        }

        .action-btn {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border: none;
          border-radius: 10px;
          cursor: pointer;
          transition: all 0.2s ease;
          font-weight: 500;
          font-size: 0.9rem;
        }

        .call-btn {
          background: #10b981;
          color: white;
        }

        .call-btn:hover {
          background: #059669;
        }

        .email-btn {
          background: #3b82f6;
          color: white;
        }

        .email-btn:hover {
          background: #2563eb;
        }

        .map-btn {
          background: #f59e0b;
          color: white;
        }

        .map-btn:hover {
          background: #d97706;
        }

        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .reach-out-container {
            padding: 16px;
          }

          .page-title {
            font-size: 2rem;
          }

          .ngo-header {
            flex-direction: column;
            align-items: center;
            text-align: center;
            gap: 16px;
          }

          .ngo-actions {
            justify-content: center;
          }

          .manual-inputs {
            flex-direction: column;
            align-items: stretch;
          }

          .input-group {
            min-width: 100%;
          }

          .address-input {
            font-size: 16px; /* Prevents zoom on iOS */
          }

          .location-text {
            font-size: 0.85rem;
          }
        }
      `}</style>
    </>
  );
};

export default ReachOutPage;