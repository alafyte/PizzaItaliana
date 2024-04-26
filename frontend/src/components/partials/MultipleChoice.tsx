import React from 'react';
import {MultipleChoicePropsType} from "../../types";

const MultipleChoice = ({id, choice, chooseItem, deleteItem, checked}: MultipleChoicePropsType) => {
    return (
        <div>
            <ul className="grid w-full gap-6 md:grid-cols-3">
                <li>
                    <input onChange={(e) =>
                        e.target.checked ? chooseItem(Number(e.target.value)) : deleteItem(Number(e.target.value))
                    } type="checkbox" checked={checked} id={id.toString()} value={id.toString()} className="hidden peer"/>
                    <label htmlFor={id.toString()}
                           className="inline-flex items-center gap-4 justify-between p-2 bg-white border-2 border-gray-200 rounded-lg cursor-pointer dark:hover:text-gray-300 dark:border-gray-700 peer-checked:border-blue-600  hover:bg-gray-50 dark:text-gray-400 dark:bg-gray-800 dark:hover:bg-gray-700">
                        <div className="block">
                            <div className="w-max font-semibold">{choice}</div>
                        </div>
                    </label>
                </li>
            </ul>

        </div>
    );
};

export default MultipleChoice;