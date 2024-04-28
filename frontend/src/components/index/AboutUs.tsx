import React from 'react';
import {SetTabPropsType} from "../../types";

const AboutUs = ({setTab} : SetTabPropsType) => {

    setTab(2);

    return (
        <div>
            <h2 className="mt-4 text-4xl font-bold sm:text-3xl dark:text-white text-center">О нас</h2>

            <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
                <p className="mb-3 text-lg dark:text-white text-justify">
                    Добро пожаловать в пиццерию Pizza Italiana!
                </p>

                <h4 className="text-3xl font-bold dark:text-white mb-4">Немного истории</h4>
                <p className="mb-3 text-lg dark:text-white text-justify">На протяжении более десяти лет мы творим
                    искусство итальянской кухни, предоставляя вам непередаваемый вкус и атмосферу настоящей Италии. Начав с
                    небольшой пиццерии, мы выросли в уютное место, где вы можете насладиться богатым разнообразием наших блюд.</p>


                <h4 className="text-3xl font-bold dark:text-white mb-4">Наши принципы</h4>
                <ul className="w-full mb-3 text-lg text-justify space-y-1 list-disc list-inside dark:text-gray-400">
                    <li>
                        <span className="font-bold">Качество над всем:</span> Мы уделяем особое внимание каждому ингредиенту, чтобы
                        каждый кусочек пиццы был
                        неповторимым. Мы используем только свежие и высококачественные продукты.
                    </li>
                    <li>
                        <span className="font-bold">Аутентичность:</span> Наши повара - настоящие мастера своего дела, приехавшие из
                        Италии, чтобы подарить вам настоящий вкус итальянской кухни. Мы придерживаемся традиционных рецептов, чтобы
                        вы могли попробовать настоящую Италию, не выезжая из города.
                    </li>
                    <li>
                        <span className="font-bold">Ваше удовольствие:</span> Мы заботимся о вашем комфорте и удовольствии от посещения
                        нашей пиццерии. У нас вы найдете уютное и семейное место, где можно насладиться приемлемыми ценами и
                        отличным обслуживанием.
                    </li>
                    <li>
                        <span className="font-bold">Доставка:</span> Если вы предпочитаете наслаждаться нашей кухней в уюте своего дома,
                        мы с радостью доставим ваш заказ прямо к вашей двери. Наслаждайтесь великолепными итальянскими блюдами, не
                        покидая свой дом.
                    </li>
                </ul>

                <h4 className="text-3xl font-bold dark:text-white mb-4">Наши достижения</h4>
                <p className="mb-3 text-lg dark:text-white text-justify">
                    За годы работы нашей пиццерии мы имеем честь заслужить признание и любовь наших клиентов. Мы гордимся тем, что
                    стали местом, куда вы возвращаетесь снова и снова. Это для нас настоящая награда и мотивация сохранять высшие
                    стандарты качества.
                </p>

                <p className="mb-3 mt-8 text-lg dark:text-white text-justify">
                    Спасибо, что выбираете Pizza Italiana. Мы всегда готовы порадовать вас невероятными вкусами и уютной
                    атмосферой. Приходите к нам и окунитесь в мир настоящей итальянской кухни!
                </p>
            </div>

        </div>
    );
};

export default AboutUs;