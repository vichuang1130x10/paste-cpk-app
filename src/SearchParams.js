import React, { useState } from "react";
import { useSelect } from "./useSelect";
import { Container, Row, Col } from "react-bootstrap";

import SelectComponent from "./SelectComponent";
import Result from "./Result";
import CAD from "./cad.json";
import BARCODE from "./Barcode.json";

const COMPTYPES = Array.from(new Set(CAD.map((obj) => obj.CompType)));
const MEASUREMENTS = ["Height(um)", "Area(%)", "Volume(%)"];

const SearchParams = () => {
  const [location, setLocation] = useState("");
  const [compTypeProps] = useSelect("");
  const [barcodePros] = useSelect("");

  const [pasteData, setPasteData] = useState([]);

  async function requestData() {
    if (location.length === 0) {
      const res = await fetch(
        // `http://pets-v2.dev-apis.com/pets?animal=${animalProps.value}&location=${location}&breed=${breedProps.value}`
        `http://localhost:5050/api/CompType/${compTypeProps.value}`
      );
      const json = await res.json();
      console.log(json.data);
      setPasteData(json.data);
    } else {
      const res = await fetch(
        // `http://pets-v2.dev-apis.com/pets?animal=${animalProps.value}&location=${location}&breed=${breedProps.value}`
        `http://localhost:5050/api/CompId/${location}`
      );
      const json = await res.json();
      console.log(json.data);
      setPasteData(json.data);
    }
    // const res = await fetch(
    //   // `http://pets-v2.dev-apis.com/pets?animal=${animalProps.value}&location=${location}&breed=${breedProps.value}`
    //   `http://localhost:5050/api/DOE_Barcode/${barcodePros.value}`
    // );
    // const json = await res.json();
    // setPasteData(json.data);
  }

  return (
    <div className="search-params">
      {/* <div className="search-params"> */}
      <div>
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
          <label htmlFor="location">
            Location
            <input
              id="location"
              value={location}
              placeholder="Location"
              onChange={(e) => setLocation(e.target.value)}
            />{" "}
          </label>
          {
            <SelectComponent
              labelName="Barcode"
              props={barcodePros}
              options={BARCODE}
            />
          }
          {/* <SelectComponent
          labelName="Breed"
          props={breedProps}
          options={breeds}
        /> */}
          <button>Submit</button>
        </form>
      </div>
      <div>
        <Result data={pasteData} options={MEASUREMENTS[0]} />
        <Result data={pasteData} options={MEASUREMENTS[1]} />
        <Result data={pasteData} options={MEASUREMENTS[2]} />
      </div>
    </div>
  );
};

export default SearchParams;
