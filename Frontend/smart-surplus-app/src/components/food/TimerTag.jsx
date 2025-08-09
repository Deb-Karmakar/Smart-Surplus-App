import { useState, useEffect } from 'react';

const TimerTag = ({ expiry }) => {
  const [timeLeft, setTimeLeft] = useState('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date();
      const expiryDate = new Date(expiry);
      const diff = expiryDate - now;

      if (diff <= 0) return 'Expired';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);

      return `${hours}h ${minutes}m left`;
    };

    setTimeLeft(calculateTimeLeft());
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 60000); // Update every minute

    return () => clearInterval(timer);
  }, [expiry]);

  return (
    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
      timeLeft === 'Expired' 
        ? 'bg-red-100 text-red-800' 
        : 'bg-yellow-100 text-yellow-800'
    }`}>
      {timeLeft}
    </span>
  );
};

export default TimerTag;