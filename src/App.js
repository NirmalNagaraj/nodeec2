import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import { Tab, Tabs, TabList, TabPanel } from "react-tabs";
import "react-tabs/style/react-tabs.css";
import "./App.css";

const App = () => {
  const [vendorDatabase, setVendorDatabase] = useState([]);
  const [vessel, setVessel] = useState([]);
  const [client, setClient] = useState([]);
  const [vendorV2, setVendorV2] = useState([]);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [vendorResponse, vesselResponse, clientResponse, vendorV2Response] = await Promise.all([
          supabase.from("vendor_database").select("*"),
          supabase.from("vessel").select("*"),
          supabase.from("client").select("*"),
          supabase.from("vendor_v2").select("*"),
        ]);

        if (
          vendorResponse.error ||
          vesselResponse.error ||
          clientResponse.error ||
          vendorV2Response.error
        ) {
          setError(
            vendorResponse.error?.message ||
              vesselResponse.error?.message ||
              clientResponse.error?.message ||
              vendorV2Response.error?.message
          );
        } else {
          setVendorDatabase(vendorResponse.data);
          setVessel(vesselResponse.data);
          setClient(clientResponse.data);
          setVendorV2(vendorV2Response.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

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
              {Object.values(row).map((value, i) => (
                <td key={i}>{value || "-"}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

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
            <Tab>Client</Tab>
            <Tab>Vendor V2</Tab>
          </TabList>

          <TabPanel>
            <h2>Vendor Database</h2>
            {renderTable(vendorDatabase)}
          </TabPanel>

          <TabPanel>
            <h2>Vessel</h2>
            {renderTable(vessel)}
          </TabPanel>

          <TabPanel>
            <h2>Client</h2>
            {renderTable(client)}
          </TabPanel>

          <TabPanel>
            <h2>Vendor V2</h2>
            {renderTable(vendorV2)}
          </TabPanel>
        </Tabs>
      )}
    </div>
  );
};

export default App;
