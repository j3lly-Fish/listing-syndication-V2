import React, { useState } from 'react';
import axios from 'axios';
import cheerio from 'cheerio';
import './App.css';

function App() {
  // Hardcoded URLs
  const url1 = 'https://feeds.hotpads.com/report/DoorLoop/latest.txt'; // Replace with the actual Zillow URL
  const url2 = 'https://www.rentalsource.com/feeds/response/doorloop-a32u3mjw.xml'; // Replace with the actual RentalSource URL

  const [unitNumber, setUnitNumber] = useState('');
  const [result1, setResult1] = useState('');
  const [lines1, setLines1] = useState([]);
  const [result2, setResult2] = useState('');
  const [lines2, setLines2] = useState([]);
  const [loading, setLoading] = useState(false);

  const handleScrape = async (url, searchTerm) => {
    const corsProxy = 'https://api.allorigins.win/get?url=';
    try {
      const response = await axios.get(corsProxy + encodeURIComponent(url), {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/58.0.3029.110 Safari/537.36'
        }
      });
      const data = response.data.contents;
      const $ = cheerio.load(data);
      const text = $.text();
      const lines = text.split('\n').map(line => line.trim()).filter(line => line);
      const foundLines = lines.filter(line => line.includes(searchTerm));
      return { status: foundLines.length > 0 ? "Found" : "Not Found", lines: foundLines };
    } catch (error) {
      return { status: `Error: ${error.message}`, lines: [] };
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult1('');
    setLines1([]);
    setResult2('');
    setLines2([]);
    try {
      const [result1Data, result2Data] = await Promise.all([
        handleScrape(url1, unitNumber),
        handleScrape(url2, unitNumber)
      ]);
      setResult1(result1Data.status);
      setLines1(result1Data.lines);
      setResult2(result2Data.status);
      setLines2(result2Data.lines);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Listing Syndication Search</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>
              Unit ID:
              <input
                type="text"
                value={unitNumber}
                onChange={(e) => setUnitNumber(e.target.value)}
                required
              />
            </label>
          </div>
          <button type="submit" disabled={loading}>
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {result1 && (
          <div>
            <h2>Results for Zillow</h2>
            <p>Status: {result1}</p>
            {lines1.map((line, index) => (
              <div key={index}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        )}
        {result2 && (
          <div>
            <h2>Results for RentalSource</h2>
            <p>Status: {result2}</p>
            {lines2.map((line, index) => (
              <div key={index}>
                <p>{line}</p>
              </div>
            ))}
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
