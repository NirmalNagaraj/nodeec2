import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";

const App = () => {
  const [vendorDatabase, setVendorDatabase] = useState([]);
  const [nonShipClients, setNonShipClients] = useState([]);
  const [shipClients, setShipClients] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("vendorDatabase");
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorResponse, nonShipResponse, shipResponse] = await Promise.all([
          supabase.from("vendordatabase").select("*"),
          supabase.from("nonshipclients").select("*"),
          supabase.from("shipclients").select("*"),
        ]);

        if (vendorResponse.error || nonShipResponse.error || shipResponse.error) {
          setError(
            vendorResponse.error?.message ||
            nonShipResponse.error?.message ||
            shipResponse.error?.message
          );
        } else {
          setVendorDatabase(vendorResponse.data);
          setNonShipClients(nonShipResponse.data);
          setShipClients(shipResponse.data);

          // Initialize search field with the first key
          if (vendorResponse.data.length > 0) {
            const firstNonObjectKey = Object.keys(vendorResponse.data[0]).find(
              (key) =>
                typeof vendorResponse.data[0][key] !== "object" &&
                vendorResponse.data[0][key] !== null
            );
            setSearchField(firstNonObjectKey || "");
          }
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const getActiveData = () => {
    switch (activeTab) {
      case "vendorDatabase":
        return vendorDatabase;
      case "nonShipClients":
        return nonShipClients;
      case "shipClients":
        return shipClients;
      default:
        return [];
    }
  };

  const filteredData = getActiveData().filter(
    (item) =>
      item[searchField] &&
      item[searchField].toString().toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderTable = (data) => (
    <div className="table-container">
      <table className="styled-table">
        <thead>
          <tr>
            {data.length > 0 &&
              Object.keys(data[0]).map((key) => <th key={key}>{key}</th>)}
          </tr>
        </thead>
        <tbody>
          {data.map((row, index) => (
            <tr key={index}>
              {Object.entries(row).map(([key, value]) => (
                <td key={key}>
                  {value && typeof value === "object" ? JSON.stringify(value) : value || "-"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  return (
    <div className="app-container">
      <h1>Data Viewer</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p className="error">Error: {error}</p>
      ) : (
        <>
          <div className="tab-container">
            <button
              className={activeTab === "vendorDatabase" ? "active" : ""}
              onClick={() => setActiveTab("vendorDatabase")}
            >
              Vendor Database
            </button>
            <button
              className={activeTab === "nonShipClients" ? "active" : ""}
              onClick={() => setActiveTab("nonShipClients")}
            >
              Non-Ship Clients
            </button>
            <button
              className={activeTab === "shipClients" ? "active" : ""}
              onClick={() => setActiveTab("shipClients")}
            >
              Ship Clients
            </button>
          </div>

          <div className="search-container">
            <select
              value={searchField}
              onChange={(e) => setSearchField(e.target.value)}
            >
              {getActiveData().length > 0 &&
                Object.keys(getActiveData()[0]).map((key) => (
                  <option key={key} value={key}>
                    {key}
                  </option>
                ))}
            </select>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <h2>{activeTab}</h2>
          {renderTable(filteredData)}
        </>
      )}
    </div>
  );
};

export default App;