export const isoStringToTime = (isoString: string) => {
    let date = new Date(isoString);
    const hours = date.getUTCHours();
    const minutes = date.getUTCMinutes();

    return `${hours < 10 ? '0' + hours : hours}:${minutes < 10 ? '0' + minutes : minutes}`;
};

export const isoStringToDateTime = (isoString: string) => {
    let date = new Date(isoString);
    const formattedDate = formatDate(date);
    const formattedTime = isoStringToTime(isoString);
    return formattedDate + " " + formattedTime;
};

export const formatDate = (date: Date): string => {
    const day: number = date.getDate();
    const month: number = date.getMonth() + 1;
    const year: number = date.getFullYear();

    const formattedDay: string = day < 10 ? '0' + day : day.toString();
    const formattedMonth: string = month < 10 ? '0' + month : month.toString();

    return `${formattedDay}-${formattedMonth}-${year}`;
}


export const getBearer = () => {
    let token = localStorage.getItem('token');
    let bearer : string = "";
    if (token) {
        bearer = `Bearer ${localStorage.getItem('token')}`;
    }
    return bearer;
}
