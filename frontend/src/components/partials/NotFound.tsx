import React from 'react';

const NotFound = () => {
    return (
        <div>
            <div className="text-center">
                <h1 className="font-bold text-7xl mb-4">404</h1>
                <p className="font-bold mb-4">Ресурс не найден</p>
                <a href="/" className="btn btn-primary">Вернуться на главную</a>
            </div>
        </div>
    );
};

export default NotFound;