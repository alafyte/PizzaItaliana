import React from 'react';
import {PaginatorPropsType} from "../../types";

const Paginator = ({paginator, changePage}: PaginatorPropsType) => {

    return (
        <div>
            <div className="flex overflow-x-auto sm:justify-center">
                {
                    paginator.hasOtherPages ?
                        <ul className="inline-flex -space-x-px text-sm my-4">
                            {
                                paginator.hasPrevious ?
                                    <>
                                        <li>
                                            <button type="button" onClick={() => changePage(1)}
                                                    className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border rounded-l-lg  border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                <span className="sr-only">Last</span>
                                                <svg className="w-2.5 h-2.5" aria-hidden="true"
                                                     xmlns="http://www.w3.org/2000/svg"
                                                     fill="none"
                                                     viewBox="0 0 6 10">
                                                    <path stroke="currentColor"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"
                                                          stroke-width="2"
                                                          d="M5 1 1 5l4 4"/>
                                                </svg>
                                                <svg className="w-2.5 h-2.5" aria-hidden="true"
                                                     xmlns="http://www.w3.org/2000/svg"
                                                     fill="none"
                                                     viewBox="0 0 6 10">
                                                    <path stroke="currentColor"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"
                                                          stroke-width="2"
                                                          d="M5 1 1 5l4 4"/>
                                                </svg>
                                            </button>
                                        </li>
                                        <li>
                                            <button type="button"
                                                    onClick={() => changePage(paginator.previousPageNumber)}
                                                    className="flex items-center justify-center px-3 h-8 ml-0 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                <span className="sr-only">Previous</span>
                                                <svg className="w-2.5 h-2.5" aria-hidden="true"
                                                     xmlns="http://www.w3.org/2000/svg"
                                                     fill="none"
                                                     viewBox="0 0 6 10">
                                                    <path stroke="currentColor"
                                                          stroke-linecap="round"
                                                          stroke-linejoin="round"
                                                          stroke-width="2"
                                                          d="M5 1 1 5l4 4"/>
                                                </svg>
                                            </button>
                                        </li>
                                    </>
                                    :
                                    <></>
                            }
                            {
                                paginator.pageRange.map(page => {
                                        if (page === paginator.currentPage) {
                                            return (<li>
                                                <a href="" aria-current="page"
                                                   className="flex items-center justify-center px-3 h-8 text-blue-600 border border-gray-300 bg-blue-50 hover:bg-blue-100 hover:text-blue-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white">
                                                    {page}
                                                </a>
                                            </li>)
                                        } else if (page >= paginator.currentPage - 2 && page <= paginator.currentPage + 2) {
                                            return (
                                                <li>
                                                    <button type="button"
                                                            onClick={() => changePage(page)}
                                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        {page}
                                                    </button>
                                                </li>
                                            )
                                        } else return (<></>)
                                    }
                                )
                            }
                            {
                                paginator.hasNext ?
                                    <>
                                        {
                                            paginator.pagesCount !== paginator.currentPage ?
                                                <>
                                                    <li>
                                                        <button type="button"
                                                                onClick={() => changePage(paginator.nextPageNumber)}
                                                                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                                                    <span
                                                                                        className="sr-only">Next</span>
                                                            <svg className="w-2.5 h-2.5"
                                                                 aria-hidden="true"
                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                 fill="none"
                                                                 viewBox="0 0 6 10">
                                                                <path stroke="currentColor"
                                                                      stroke-linecap="round"
                                                                      stroke-linejoin="round"
                                                                      stroke-width="2"
                                                                      d="m1 9 4-4-4-4"/>
                                                            </svg>
                                                        </button>
                                                    </li>
                                                    <li>
                                                        <button type="button"
                                                                onClick={() => changePage(paginator.pagesCount)}
                                                                className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                                                    <span
                                                                                        className="sr-only">Last</span>
                                                            <svg className="w-2.5 h-2.5"
                                                                 aria-hidden="true"
                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                 fill="none"
                                                                 viewBox="0 0 6 10">
                                                                <path stroke="currentColor"
                                                                      stroke-linecap="round"
                                                                      stroke-linejoin="round"
                                                                      stroke-width="2"
                                                                      d="m1 9 4-4-4-4"/>
                                                            </svg>
                                                            <svg className="w-2.5 h-2.5"
                                                                 aria-hidden="true"
                                                                 xmlns="http://www.w3.org/2000/svg"
                                                                 fill="none"
                                                                 viewBox="0 0 6 10">
                                                                <path stroke="currentColor"
                                                                      stroke-linecap="round"
                                                                      stroke-linejoin="round"
                                                                      stroke-width="2"
                                                                      d="m1 9 4-4-4-4"/>
                                                            </svg>
                                                        </button>
                                                    </li>
                                                </> :
                                                <li>
                                                    <button type="button"
                                                            onClick={() => changePage(paginator.pagesCount)}
                                                            className="flex items-center justify-center px-3 h-8 leading-tight text-gray-500 bg-white border border-gray-300 rounded-r-lg hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white">
                                                        <span className="sr-only">Last</span>
                                                        <svg className="w-2.5 h-2.5"
                                                             aria-hidden="true"
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             fill="none"
                                                             viewBox="0 0 6 10">
                                                            <path stroke="currentColor"
                                                                  stroke-linecap="round"
                                                                  stroke-linejoin="round"
                                                                  stroke-width="2"
                                                                  d="m1 9 4-4-4-4"/>
                                                        </svg>
                                                        <svg className="w-2.5 h-2.5"
                                                             aria-hidden="true"
                                                             xmlns="http://www.w3.org/2000/svg"
                                                             fill="none"
                                                             viewBox="0 0 6 10">
                                                            <path stroke="currentColor"
                                                                  stroke-linecap="round"
                                                                  stroke-linejoin="round"
                                                                  stroke-width="2"
                                                                  d="m1 9 4-4-4-4"/>
                                                        </svg>
                                                    </button>
                                                </li>
                                        }
                                    </>
                                    :
                                    <></>
                            }
                        </ul>
                        :
                        <></>
                }
            </div>
        </div>
    );
};

export default Paginator;