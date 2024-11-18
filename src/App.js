import React, { useState, useEffect } from "react";
import {supabase} from './supabase'
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import './App.css'

const App = () => {
  const [vendorDatabase, setVendorDatabase] = useState([]);
  const [vessel, setVessel] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorResponse, vesselResponse] = await Promise.all([
          supabase.from("vendor_database").select("*"),
          supabase.from("vessel").select("*"),
        ]);

        if (vendorResponse.error || vesselResponse.error) {
          setError(
            vendorResponse.error?.message || vesselResponse.error?.message
          );
        } else {
          setVendorDatabase(vendorResponse.data);
          setVessel(vesselResponse.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ textAlign: "center" }}>Data Viewer</h1>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>Error: {error}</p>
      ) : (
        <Tabs>
          <TabList>
            <Tab>Vendor Database</Tab>
            <Tab>Vessel</Tab>
          </TabList>

          {/* Vendor Database Tab */}
          <TabPanel>
            <h2>Vendor Database</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    {vendorDatabase.length > 0 &&
                      Object.keys(vendorDatabase[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {vendorDatabase.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>

          {/* Vessel Tab */}
          <TabPanel>
            <h2>Vessel</h2>
            <div className="table-container">
              <table className="styled-table">
                <thead>
                  <tr>
                    {vessel.length > 0 &&
                      Object.keys(vessel[0]).map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                  </tr>
                </thead>
                <tbody>
                  {vessel.map((row, index) => (
                    <tr key={index}>
                      {Object.values(row).map((value, i) => (
                        <td key={i}>{value || "-"}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};

export default App;
