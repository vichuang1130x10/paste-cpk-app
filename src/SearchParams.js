import React, { useState, useEffect } from "react";
import { useSelect } from "./useSelect";
import { useBreedList } from "./useBreedList";
import SelectComponent from "./SelectComponent";
import Result from "./Result";
import CAD from "./cad.json";
const ANIMALS = ["bird", "cat", "dog", "rabbit", "reptile"];

const COMPTYPES = Array.from(new Set(CAD.map((obj) => obj.CompType)));

const SearchParams = () => {
  const [location, setLocation] = useState("");
  const [compTypeProps] = useSelect("");
  const [animalProps] = useSelect("");
  const [breedProps] = useSelect("");
  const [breeds] = useBreedList(animalProps.value);

  const [pasteData, setPasteData] = useState([]);

  // useEffect(() => {
  //   requestPets();
  // }, []); // eslint-disable-line

  async function requestData() {
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
          labelName="animal"
          props={animalProps}
          options={ANIMALS}
        />
        <SelectComponent
          labelName="Breed"
          props={breedProps}
          options={breeds}
        /> */}
        <button>Submit</button>
      </form>
      <Result data={pasteData} />
    </div>
  );
};

export default SearchParams;
