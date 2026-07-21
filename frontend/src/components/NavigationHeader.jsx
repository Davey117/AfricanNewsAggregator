// src/components/NavigationHeader.js
import React from 'react';
import { useSearchAndFilter } from '../context/SearchAndFilterContext';

export default function NavigationHeader() {
  const { searchQuery, setSearchQuery, selectedCountry, setSelectedCountry } = useSearchAndFilter();

  return (
    <header className="w-full bg-slate-900 text-white shadow-md sticky top-0 z-50 px-4 py-3">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-3">
        
        {/* Academic Platform Identity */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-start">
          <h1 className="text-xl font-bold tracking-tight text-emerald-400 text-center sm:text-left w-full sm:w-auto">
            African Educational News Aggregator
          </h1>
        </div>

        {/* Global Structural Search Input Matrix */}
        <div className="w-full sm:max-w-md relative">
          <input
            type="text"
            className="w-full bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-lg border border-slate-700 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-emerald-500 transition-all duration-200"
            placeholder="Search for articles, keywords, or policies..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs font-semibold"
            >
              CLEAR
            </button>
          )}
        </div>

        {/* Geographic Origin Selector */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end text-xs">
          <span className="text-slate-400 uppercase tracking-wider font-medium">Region:</span>
          <select
            className="bg-slate-800 text-slate-200 border border-slate-700 rounded px-2 py-1 focus:ring-1 focus:ring-emerald-500 outline-none"
            value={selectedCountry}
            onChange={(e) => setSelectedCountry(e.target.value)}
          >
            <option value="DZ">Algeria (DZ)</option>
            <option value="AO">Angola (AO)</option>
            <option value="BJ">Benin (BJ)</option>
            <option value="BW">Botswana (BW)</option>
            <option value="BF">Burkina Faso (BF)</option>
            <option value="BI">Burundi (BI)</option>
            <option value="CV">Cabo Verde (CV)</option>
            <option value="CM">Cameroon (CM)</option>
            <option value="CF">Central African Republic (CF)</option>
            <option value="TD">Chad (TD)</option>
            <option value="KM">Comoros (KM)</option>
            <option value="CD">Congo (DRC) (CD)</option>
            <option value="CG">Congo (Republic) (CG)</option>
            <option value="CI">Côte d'Ivoire (CI)</option>
            <option value="DJ">Djibouti (DJ)</option>
            <option value="EG">Egypt (EG)</option>
            <option value="GQ">Equatorial Guinea (GQ)</option>
            <option value="ER">Eritrea (ER)</option>
            <option value="SZ">Eswatini (SZ)</option>
            <option value="ET">Ethiopia (ET)</option>
            <option value="GA">Gabon (GA)</option>
            <option value="GM">Gambia (GM)</option>
            <option value="GH">Ghana (GH)</option>
            <option value="GN">Guinea (GN)</option>
            <option value="GW">Guinea-Bissau (GW)</option>
            <option value="KE">Kenya (KE)</option>
            <option value="LS">Lesotho (LS)</option>
            <option value="LR">Liberia (LR)</option>
            <option value="LY">Libya (LY)</option>
            <option value="MG">Madagascar (MG)</option>
            <option value="MW">Malawi (MW)</option>
            <option value="ML">Mali (ML)</option>
            <option value="MR">Mauritania (MR)</option>
            <option value="MU">Mauritius (MU)</option>
            <option value="MA">Morocco (MA)</option>
            <option value="MZ">Mozambique (MZ)</option>
            <option value="NA">Namibia (NA)</option>
            <option value="NE">Niger (NE)</option>
            <option value="NG">Nigeria (NG)</option>
            <option value="RE">Réunion (RE)</option>
            <option value="RW">Rwanda (RW)</option>
            <option value="ST">São Tomé and Príncipe (ST)</option>
            <option value="SN">Senegal (SN)</option>
            <option value="SC">Seychelles (SC)</option>
            <option value="SL">Sierra Leone (SL)</option>
            <option value="SO">Somalia (SO)</option>
            <option value="ZA">South Africa (ZA)</option>
            <option value="SS">South Sudan (SS)</option>
            <option value="SD">Sudan (SD)</option>
            <option value="TZ">Tanzania (TZ)</option>
            <option value="TG">Togo (TG)</option>
            <option value="TN">Tunisia (TN)</option>
            <option value="UG">Uganda (UG)</option>
            <option value="EH">Western Sahara (EH)</option>
            <option value="ZM">Zambia (ZM)</option>
            <option value="ZW">Zimbabwe (ZW)</option>
          </select>
        </div>

      </div>
    </header>
  );
}