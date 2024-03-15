import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import cookie_session from "cookie-session";
import authRouter from '../routes/authRouter';
import adminRouter from "../routes/adminRouter";
import restaurantRouter from "../routes/restaurantsRouter";
import apiRouter from "../routes/apiRouter";
import couriersRouter from "../routes/couriersRouter";
import menuRouter from "../routes/menuRouter";
import cartRouter from "../routes/cartRouter";
import orderRouter from "../routes/orderRouter";
import userRouter from "../routes/userRouter";
import ingredientRouter from "../routes/ingredientRouter";
import cors from "cors";

const app = express();


app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(process.cwd(), 'public')));

app.use(cookie_session({
    name: '_es_usr_session',
    secret: 'kkd983-dw622-345kkcvm',
    // sameSite: 'none',
    // secure: true,
    httpOnly: true,
}));

app.enable('trust proxy');

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3006',
}));

app.use('/auth', authRouter);
app.use('/admin', adminRouter);
app.use('/api', apiRouter);
app.use('/restaurants', restaurantRouter);
app.use('/couriers', couriersRouter);
app.use('/menu', menuRouter);
app.use('/cart', cartRouter);
app.use('/order', orderRouter);
app.use('/user', userRouter);
app.use('/ingredient', ingredientRouter);

app.listen(3000, () => console.log('Server is running at http://localhost:3000'));
