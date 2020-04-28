// finds max x, y in an array
const findMaxPoint = array => {
    return array.reduce((prev, current) => {
        const x = prev.x > current.x ? prev.x : current.x;
        const y = prev.y > current.y ? prev.y : current.y;

        return { x, y };
    });
};


// finds min x, y in an array
const findMinPoint = array => {
    return array.reduce((prev, current) => {
        const x = prev.x < current.x ? prev.x : current.x;
        const y = prev.y < current.y ? prev.y : current.y;

        return { x, y };
    });
};

// ===============================================
//         Check overlap functions
// ==============================================
/************
 * Check x point
 */

// if we have overlaps in xAxis
const xOverlap = (block1, block2) => {
    return block1.startPoint.x >= block2.startPoint.x &&
        block1.startPoint.x <= block2.endPoint.x ?
        true :
        false;
};

// if we have overlaps in yAxis
const yOverlap = (block1, block2) => {
    return block1.startPoint.y >= block2.startPoint.y &&
        block1.startPoint.y <= block2.endPoint.y ?
        true :
        false;
};

// if we have overlaps in area
const doBlocksOverlap = (block1, block2) => {
    return xOverlap(block1, block2) && yOverlap(block1, block2) ? true : false;
};


// finds max Y of the blocks
const calculateMaxY = data => {
    let maxY = 0;
    data.forEach(block => {
        maxY = maxY > block.endPoint.y ? maxY : block.endPoint.y;
    });
    return maxY;
};

// moves overlaped blocks to the max Y
const moveBlockToEndY = (block, y) => {
    const yTrans = y - block.startPoint.y + 120;

    block.startPoint.y = yTrans;
    block.endPoint.y += yTrans;

    block.seats.forEach(seat => {
        seat.y += yTrans;
    });
};
// set the values to the response
const sortOverlapedBlocks = data => {
    let maxY = calculateMaxY(data);

    // check block to block to see if we have overlaps
    data.forEach(block1 =>
        data.forEach(block2 => {

            if (block1.block_id !== block2.block_id) {
                if (doBlocksOverlap(block1, block2)) {
                    maxY = calculateMaxY(data);
                    moveBlockToEndY(block2, maxY);
                }
            }
        })
    );
};
// ==========================================
//          End overlap functions
// ==========================================

// api response is a little bit weird so filter it to a better format here

const sortResponse = response => {
    const sortedResponse = [];

    response.blocks.forEach(block => {
        let blockObj = { block_id: block.block_id };
        blockObj.seats = [];

        // convert array type data to a object form data
        block.seats.forEach(seat => {
            let seatObj = {
                schedule_seat_id: seat[0],
                seat_id: seat[1],
                x: seat[2],
                y: seat[3],
                type: seat[4],
                row: seat[5],
                number: seat[6],
                price: seat[7]
            };
            blockObj.seats.push(seatObj);

            const startPoint = findMinPoint(blockObj.seats);
            const endPoint = findMaxPoint(blockObj.seats);

            blockObj.startPoint = startPoint;
            blockObj.endPoint = endPoint;
        });

        sortedResponse.push(blockObj);
    });

    // fixes overlaped blocks coordinates
    sortOverlapedBlocks(sortedResponse);

    return sortedResponse;
};

export { sortResponse, findMaxPoint, findMinPoint };