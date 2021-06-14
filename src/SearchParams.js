import React, { useState } from "react";
import { useSelect } from "./useSelect";

import SelectComponent from "./SelectComponent";
import Result from "./Result";
import CAD from "./cad.json";

const COMPTYPES = Array.from(new Set(CAD.map((obj) => obj.CompType)));
const MEASUREMENTS = ["Height(um)", "Area(%)", "Volume(%)"];

const SearchParams = () => {
  const [location, setLocation] = useState("");
  const [compTypeProps] = useSelect("");
  const [measurementPros] = useSelect("");

  const [pasteData, setPasteData] = useState([]);

  async function requestData() {
    if (!compTypeProps.value) return;
    const res = await fetch(
      // `http://pets-v2.dev-apis.com/pets?animal=${animalProps.value}&location=${location}&breed=${breedProps.value}`
      `http://localhost:5050/api/CompType/${compTypeProps.value}`
    );
    const json = await res.json();
    console.log(json.data);
    setPasteData(json.data);
  }

  return (
    <div className="search-params">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          requestData();
        }}
      >
        <SelectComponent
          labelName="CompType"
          props={compTypeProps}
          options={COMPTYPES}
        />
        {/* <SelectComponent
          labelName="Measurement"
          props={measurementPros}
          options={MEASUREMENTS}
        /> */}
        {/* <SelectComponent
          labelName="Breed"
          props={breedProps}
          options={breeds}
        /> */}
        <button>Submit</button>
      </form>
      <Result data={pasteData} options={MEASUREMENTS[0]} />
      <Result data={pasteData} options={MEASUREMENTS[1]} />
      <Result data={pasteData} options={MEASUREMENTS[2]} />
    </div>
  );
};

export default SearchParams;
