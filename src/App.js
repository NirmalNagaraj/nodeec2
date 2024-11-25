import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";
import "./App.css";

const App = () => {
  const [vendorDatabase, setVendorDatabase] = useState([]);
  const [nonShipClients, setNonShipClients] = useState([]);
  const [shipClients, setShipClients] = useState([]);
  const [vendorServices, setVendorServices] = useState([]);
  const [overheadData, setOverheadData] = useState({});
  const [activeTab, setActiveTab] = useState("vendorDatabase");
  const [activeOverheadTab, setActiveOverheadTab] = useState(null);
  const [searchField, setSearchField] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [vendorResponse, nonShipResponse, shipResponse, vendorServicesResponse] = await Promise.all([
          supabase.from("vendor_database").select("*"),
          supabase.from("nonshipclients").select("*"),
          supabase.from("shipclients").select("*"),
          supabase.from("vendor_services").select("*"),
        ]);

        if (vendorResponse.error || nonShipResponse.error || shipResponse.error || vendorServicesResponse.error) {
          setError(
            vendorResponse.error?.message ||
            nonShipResponse.error?.message ||
            shipResponse.error?.message ||
            vendorServicesResponse.error?.message
          );
        } else {
          setVendorDatabase(vendorResponse.data);
          setNonShipClients(nonShipResponse.data);
          setShipClients(shipResponse.data);
          setVendorServices(vendorServicesResponse.data);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const fetchOverheadData = async (table) => {
    try {
      setLoading(true);

      // Fetch the data for the selected overhead table
      const response = await supabase.from(table).select("*");

      if (response.error) {
        throw new Error(response.error.message);
      }

      let fetchedData = response.data;

      // Handling references (foreign keys) for certain tables
      if (table === "overhead_freight_costing_parameters") {
        const freightResponse = await supabase.from("overhead_freight_forwarding_agents").select("*");
        if (freightResponse.error) {
          throw new Error(freightResponse.error.message);
        }

        fetchedData = fetchedData.map(item => ({
          ...item,
          freightAgentData: freightResponse.data.find(agent => agent.id === item.freight_agent_id) || {},
        }));
      }

      if (table === "overhead_transporters") {
        const transportersResponse = await supabase.from("overhead_warehousing_companies").select("*");
        const networkChandlersResponse = await supabase.from("overhead_network_chandlers").select("*");

        if (transportersResponse.error || networkChandlersResponse.error) {
          throw new Error("Error fetching related data for transporters.");
        }

        fetchedData = fetchedData.map(item => ({
          ...item,
          warehousingData: transportersResponse.data.find(company => company.id === item.warehousing_company_id) || {},
          networkChandlerData: networkChandlersResponse.data.find(chandler => chandler.id === item.network_chandler_id) || {},
        }));
      }

      if (table === "overhead_ship_agents") {
        const warehousingResponse = await supabase.from("overhead_warehousing_companies").select("*");
        const networkChandlersResponse = await supabase.from("overhead_network_chandlers").select("*");

        if (warehousingResponse.error || networkChandlersResponse.error) {
          throw new Error("Error fetching related data for ship agents.");
        }

        fetchedData = fetchedData.map(item => ({
          ...item,
          warehousingData: warehousingResponse.data.find(company => company.id === item.warehousing_company_id) || {},
          networkChandlerData: networkChandlersResponse.data.find(chandler => chandler.id === item.network_chandler_id) || {},
        }));
      }

      // Store the fetched data for the specific table in the overheadData state
      setOverheadData((prevData) => ({
        ...prevData,
        [table]: fetchedData,
      }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "overheads") {
      // When "Overheads" is clicked, initialize sub-tabs for the overhead tables
      const overheadTables = [
        "overhead_warehousing_companies",
        "overhead_vms_operations_team",
        "overhead_exports_imports_agents",
        "overhead_freight_forwarding_agents",
        "overhead_customs_house_agents",
        "overhead_labourers",
        "overhead_transporters",
        "overhead_network_chandlers",
        "overhead_ship_agents",
      ];

      // Set the first overhead table as active by default
      if (overheadTables.length > 0) {
        setActiveOverheadTab(overheadTables[0]);
        fetchOverheadData(overheadTables[0]);
      }
    }
  };

  const handleOverheadTabClick = (table) => {
    setActiveOverheadTab(table);
    if (!overheadData[table]) {
      fetchOverheadData(table);
    }
  };

  const getActiveData = () => {
    switch (activeTab) {
      case "vendorDatabase":
        return vendorDatabase;
      case "nonShipClients":
        return nonShipClients;
      case "shipClients":
        return shipClients;
      case "vendorServices":
        return vendorServices;
      case "overheads":
        return overheadData[activeOverheadTab] || [];
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
              onClick={() => handleTabClick("vendorDatabase")}
            >
              Vendor Database
            </button>
            <button
              className={activeTab === "nonShipClients" ? "active" : ""}
              onClick={() => handleTabClick("nonShipClients")}
            >
              Non-Ship Clients
            </button>
            <button
              className={activeTab === "shipClients" ? "active" : ""}
              onClick={() => handleTabClick("shipClients")}
            >
              Ship Clients
            </button>
            <button
              className={activeTab === "vendorServices" ? "active" : ""}
              onClick={() => handleTabClick("vendorServices")}
            >
              Vendor Services
            </button>
            <button
              className={activeTab === "overheads" ? "active" : ""}
              onClick={() => handleTabClick("overheads")}
            >
              Overheads
            </button>
          </div>

          {activeTab === "overheads" && (
            <div className="sub-tab-container">
              {[
                "overhead_warehousing_companies",
                "overhead_vms_operations_team",
                "overhead_exports_imports_agents",
                "overhead_freight_forwarding_agents",
                "overhead_customs_house_agents",
                "overhead_labourers",
                "overhead_transporters",
                "overhead_network_chandlers",
                "overhead_ship_agents",
              ].map((table) => (
                <button
                  key={table}
                  className={activeOverheadTab === table ? "active" : ""}
                  onClick={() => handleOverheadTabClick(table)}
                >
                  {table}
                </button>
              ))}
            </div>
          )}

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

          <h2>{activeTab === "overheads" ? activeOverheadTab : activeTab}</h2>
          {renderTable(filteredData)}
        </>
      )}
    </div>
  );
};

export default App;