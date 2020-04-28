import React, { useState, useEffect } from "react";

// components
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// length
const SEAT_WIDTH = 28;
const SEAT_RADIOUS = 4;
const SEAT_BORDER = 0.3;

const SEATS_HORIZENTAL_SPACE = 6;
const SEATS_VERTICAL_SPACE = 7;

const BLOCK_TOP_BOTTOM_PADDING = 12;
const BLOCK_LEFT_RIGHT_PADDING = 12;

const BLOCKS_SPACE = 12;
const BLOCK_RADIUS = 6;

// color
const RESERVED_SEAT_COLOR = "#e2e2e2";
const SELECTED_SEAT_COLOR = "#009777";
const SELECTABLE_SEAT_BORDER_COLOR = "#808285";
const BLOCK_BACKGROUND_COLOR = "#f7f7f7";

const Seatmap = ({
  data,
  selected,
  width,
  height,
  onSeatClick,
  onBlockClick,
  disablePinch,
  disablePan
}) => {
  const [boundingBox, setBoundingBox] = useState({});

  // get bounding box properties, what is bounding box? it's the imaginary box that covers all the blocks we drew
  const getBoundingBox = () => {
    // it should return startPoint, endPoint and offeset left and right of bounding-box
    const box = data.reduce((prev, current) => {
      // prev
      const prevStartPoint = prev.startPoint;
      const prevEndPoint = prev.endPoint;

      // current
      const currentStartPoint = current.startPoint;
      const currentEndPoint = current.endPoint;

      // find max startPoint of the bounding box
      const boxStartX =
        prevStartPoint.x < currentStartPoint.x
          ? prevStartPoint.x
          : currentStartPoint.x;
      const boxStartY =
        prevStartPoint.y < currentStartPoint.y
          ? prevStartPoint.y
          : currentStartPoint.y;

      // find min startPoint of the bounding box
      const boxEndX =
        prevEndPoint.x > currentEndPoint.x ? prevEndPoint.x : currentEndPoint.x;
      const boxEndY =
        prevEndPoint.y > currentEndPoint.y ? prevEndPoint.y : currentEndPoint.y;

      return {
        startPoint: { x: boxStartX, y: boxStartY },
        endPoint: { x: boxEndX, y: boxEndY }
      };
    });

    // mesure width and height of the bounding box
    const width = box.endPoint.x - box.startPoint.x;
    const height = box.endPoint.y - box.startPoint.y;

    return {
      ...box,
      width,
      height
    };
  };

  // mesures bounding box, bounding box is used to fit drawing in the view-box of the svg
  const fixRatio = () => {
    const boundingBox = getBoundingBox();
    setBoundingBox(boundingBox);
  };

  // checks if seat_id exists in the selected list
  const isSeatSelected = seat =>
    selected && selected.findIndex(_ => _.seat_id === seat.seat_id) > -1;

  // on component did mount
  useEffect(() => {
    fixRatio();
  }, []);

  /** block startPoint and endPoint did came from thier seats startPoints
  so we  need to add SEAT_WIDTH to it to fit all the seats in also we have some padding
  here so we substract them from block startPoint and add it to the endPoint to get the padding */
  const offset = {
    startPoint: {
      x: SEAT_BORDER + BLOCK_LEFT_RIGHT_PADDING,
      y: SEAT_BORDER + BLOCK_TOP_BOTTOM_PADDING
    },
    endPoint: {
      x:
        SEAT_WIDTH +
        SEAT_BORDER +
        SEAT_BORDER +
        BLOCK_LEFT_RIGHT_PADDING +
        BLOCK_LEFT_RIGHT_PADDING,
      y:
        SEAT_WIDTH +
        SEAT_BORDER +
        SEAT_BORDER +
        BLOCK_TOP_BOTTOM_PADDING +
        BLOCK_TOP_BOTTOM_PADDING
    }
  };

  /** we use the offset above and bounging box properties to draw the imaginary
  viewBox this will help us to cover drawing in the screen */

  const viewBox =
    boundingBox.startPoint &&
    boundingBox.endPoint &&
    `${boundingBox.startPoint.x - offset.startPoint.x} ${boundingBox.startPoint
      .y - offset.startPoint.y} ${boundingBox.width +
      offset.endPoint.x} ${boundingBox.height + offset.endPoint.y}`;

  return (
    <TransformWrapper
      doubleClick={{ mode: "reset", disabled: true }}
      pan={{ disabled: disablePan }}
      pinch={{ disabled: disablePinch }}
      zoomIn={{ disabled: disablePinch }}
      zoomOut={{ disabled: disablePinch }}
      wheel={{ disabled: disablePinch }}
    >
      <TransformComponent>
        <svg
          width={width}
          height={height}
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid"
        >
          <g>
            {data.map((block, index) => {
              return (
                <g
                  key={index}
                  onClick={event => onBlockClick && onBlockClick(event, block)}
                >
                  <rect
                    x={block.startPoint.x - BLOCK_LEFT_RIGHT_PADDING}
                    y={block.startPoint.y - BLOCK_TOP_BOTTOM_PADDING}
                    width={
                      block.endPoint.x -
                      block.startPoint.x +
                      SEAT_WIDTH +
                      BLOCK_LEFT_RIGHT_PADDING * 2
                    }
                    height={
                      block.endPoint.y -
                      block.startPoint.y +
                      SEAT_WIDTH +
                      BLOCK_TOP_BOTTOM_PADDING * 2
                    }
                    fill={BLOCK_BACKGROUND_COLOR}
                    rx={BLOCK_RADIUS}
                    ry={BLOCK_RADIUS}
                  />

                  {block.seats.map((seat, index) => (
                    <rect
                      key={index}
                      onClick={event => onSeatClick && onSeatClick(event, seat)}
                      x={seat.x}
                      y={seat.y}
                      width={SEAT_WIDTH}
                      height={SEAT_WIDTH}
                      rx={SEAT_RADIOUS}
                      ry={SEAT_RADIOUS}
                      fill={
                        isSeatSelected(seat)
                          ? SELECTED_SEAT_COLOR
                          : "transparent"
                      }
                      stroke={SELECTABLE_SEAT_BORDER_COLOR}
                      strokeWidth={SEAT_BORDER}
                    />
                  ))}
                </g>
              );
            })}
          </g>
        </svg>
      </TransformComponent>
    </TransformWrapper>
  );
};

export default Seatmap;
