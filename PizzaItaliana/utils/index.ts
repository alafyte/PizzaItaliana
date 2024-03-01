import {User_order} from "@prisma/client";

export const stringToDate = (str: string) : Date => {
    const pattern = /(\d{2})-(\d{2})-(\d{4})/;
    return new Date(str.replace(pattern, '$3-$2-$1'));
}


export const findClosestDateObject = (objects: User_order[]) => {
    const targetDateTime =  new Date();
    let closestDateTime = new Date(objects[0].date_of_order.toISOString().slice(0, -1));
    let closestIndex = 0;
    // @ts-ignore
    let closestDifference = Math.abs(targetDateTime - closestDateTime);

    for (let i = 1; i < objects.length; i++) {
        const currentDateTime = new Date(objects[i].date_of_order.toISOString().slice(0, -1));
        // @ts-ignore
        const currentDifference = Math.abs(targetDateTime - currentDateTime);
        if (currentDifference < closestDifference) {
            closestIndex = i;
            closestDifference = currentDifference;
        }
    }

    return objects[closestIndex].id;
}

export const getAllObjectsPage = async (objects: any, pageNumber: number, pageSize: number) => {
    let result = [];
    for (let i = 0; i < objects.length; i++) {
        if (i >= pageSize * (pageNumber - 1) && i < pageSize * pageNumber) {
            result.push(objects[i]);
        }
    }
    let pagesCount = Math.ceil(objects.length / pageSize);

    let hasOtherPages = pagesCount !== 1;
    let hasNext = +pageNumber !== pagesCount;
    let nextPageNumber = hasNext ? +pageNumber + 1 : 0;
    let hasPrevious = +pageNumber !== 1;
    let previousPageNumber = hasPrevious ? +pageNumber - 1 : 0;

    let pageRange = []

    for (let i = 1; i <= pagesCount; i++) {
        pageRange.push(i);
    }
    return {
        objects: result,
        paginator: {
            pagesCount: pagesCount,
            currentPage: +pageNumber,
            hasOtherPages: hasOtherPages,
            hasNext: hasNext,
            nextPageNumber: nextPageNumber,
            hasPrevious: hasPrevious,
            previousPageNumber: previousPageNumber,
            pageRange: pageRange
        }
    };
}