import React, { useState, useEffect } from "react";

// utils
import { sortResponse } from "./utils";

// data
import response from "./response2.json";

// components
import Seatmap from "./components/Seatmap";

// styles
import "./App.css";

// stores prev selected seats, after cancel we set selected to this variable
let prevSelected = [];

const App = () => {
  const [selectModal, setSelectModal] = useState({ open: false, item: [] });
  const [seatmaps, setSeatmaps] = useState(null);
  const [selected, setSelected] = useState([]);

  // open select modal, item is the selected block object
  const handleOpenSelectModal = (event, item) => {
    setSelectModal({ open: true, item: [item] });
    prevSelected = selected;
  };

  // close select modal, has a clear parameter if true: clear selected list else keep the state
  const handleCloseSelectModal = (event, clear) => {
    setSelectModal({ open: false });
    clear && setSelected(prevSelected);
  };

  // on seat click
  const handleSeatClick = (event, seat) => {
    const selectedIndex = selected.findIndex(
      select => select.seat_id === seat.seat_id
    );

    let newSelected = [];

    // if we didn't find the index add it to the array
    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, seat);
    }
    // if is the first index remove it
    else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    }
    // if is the last index remove it
    else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    }
    // if is in middle remove it
    else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1)
      );
    }
    setSelected(newSelected);
  };

  // on component did mount
  useEffect(() => {
    // sort response from api to the better data structure
    const seatmapData = sortResponse(response.data);
    setSeatmaps(seatmapData);
  }, []);

  return (
    <div className="app">
      {!selectModal.open && (
        <div className="modal">
          <div className="modal_header">
            <h3>Cinema</h3>
          </div>

          <div className="modal_content">
            {seatmaps && (
              <Seatmap
                disablePan
                disablePinch
                width="100%"
                selected={selected}
                height={250}
                data={seatmaps}
                onBlockClick={handleOpenSelectModal}
              />
            )}
          </div>
        </div>
      )}

      {selectModal.open && (
        <React.Fragment>
          <div className="backdrop"></div>
          <div className="dialog">
            <button
              className="exit-button"
              onClick={event => handleCloseSelectModal(event, true)}
            >
              X
            </button>
            <div className="modal_header">
              <h3>Select</h3>
            </div>

            <div className="modal_content">
              <Seatmap
                width="100%"
                height={250}
                data={selectModal.item}
                onSeatClick={handleSeatClick}
                selected={selected}
              />
            </div>

            <div className="modal_actions">
              <button
                onClick={event => handleCloseSelectModal(event, false)}
                className="button"
              >
                Reserve
              </button>
            </div>
          </div>
        </React.Fragment>
      )}
    </div>
  );
};

export default App;
