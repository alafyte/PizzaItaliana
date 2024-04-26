import React from 'react';
import {SetTabPropsType} from "../../types";

const ForClient = ({setTab} : SetTabPropsType) => {
    setTab(4);

    return (
        <div>
            <h2 className="mt-4 text-4xl font-bold sm:text-3xl dark:text-white text-center">Клиенту</h2>

            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <p className="mb-3 text-lg dark:text-white text-justify">
                    Ознакомьтесь с нашим разнообразным меню, где вы найдете лучшие блюда итальянской кухни. От свежих пицц и
                    ароматных паст до аппетитных закусок и десертов. Мы гарантируем, что каждое блюдо приготовлено с любовью и из
                    свежих ингредиентов.
                </p>
                <h4 className="text-3xl font-bold dark:text-white mb-4">Доставка</h4>
                <p className="mb-3 text-lg dark:text-white text-justify">Нет времени посетить нашу пиццерию? Не беда! Мы предлагаем
                    быструю и надежную услугу доставки. Закажите наши блюда, и мы привезем их прямо к вам домой или в офис. Просто
                    выберите свои любимые блюда из меню и наслаждайтесь!</p>
                <p className="mb-3 text-lg dark:text-white text-justify">
                    У нас есть удобные способы связи. Если у вас есть какие-либо вопросы, предложения или пожелания, не стесняйтесь
                    обращаться к нам. Мы всегда готовы помочь!
                </p>

                <h4 className="text-3xl font-bold dark:text-white mb-4">Почему выбирают нас:</h4>
                <ul className="w-full mb-3 text-lg text-justify space-y-1 list-disc list-inside dark:text-gray-400">
                    <li>
                        <span className="font-bold">Итальянский вкус:</span> Мы готовим с любовью и страстью, чтобы вам было вкусно.
                    </li>
                    <li>
                        <span className="font-bold">Свежие ингредиенты:</span> Мы выбираем только качественные продукты.
                    </li>
                    <li>
                        <span className="font-bold">Уютная атмосфера:</span> Мы создаем комфортное место для вашего отдыха.
                    </li>
                    <li>
                        <span className="font-bold">Быстрая доставка:</span> Мы привозим блюда быстро и надежно.
                    </li>
                    <li>
                        <span className="font-bold">Дружелюбный персонал:</span> Наши сотрудники всегда готовы к встрече с улыбкой.
                    </li>
                </ul>
            </div>

        </div>
    );
};

export default ForClient;