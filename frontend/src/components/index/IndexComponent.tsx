import React from 'react';
import DisplayMenu from "../menu/DisplayMenu";

const IndexComponent = () => {

    return (
        <div>
            <h2 className="lg:text-4xl text-3xl font-extrabold dark:text-white text-center mb-8">
                Меню
            </h2>
         <DisplayMenu menuUrlAction={"details"}/>
        </div>
    );
};

export default IndexComponent;