import express from "express";
import { logger } from "./utils/Logger";
import { useSentry } from "./utils/Sentry";
import cors from "cors";
import http from "http";
import io from "socket.io";

export class App {
    private app: express.Application;
    private server: http.Server;
    private io: SocketIO.Server;

    constructor() {
        this.app = express();
        this.setMiddlewares();
        this.setSocketServer();
    }

    private setMiddlewares(): void {
        this.app.use(cors());
        useSentry(this.app);
    }

    private setSocketServer(): void {
        this.server = http.createServer(this.app);
        this.io = io.listen(this.server);
    }

    public async runChatServer(port: number) {
        try {
            this.server.listen(port, () => {
                logger.info(`Server is running on http://localhost:${port}`);
            });

            this.io.on("connect", (socket: any) => {
                logger.info(`Connected client on port ${port}`);

                socket.on("join", (data: any) => {
                    logger.info(`chat join: ${data.name}(${data.userId})`);

                    socket.name = data.name;
                    socket.userId = data.userId;
                });

                socket.on("send message", (data: any) => {
                    logger.info(
                        `${socket.name}(${socket.userId}): ${data.message}`,
                    );

                    const response = {
                        name: socket.name,
                        message: data.message,
                    };

                    this.io.emit("message", response);
                });

                socket.on("disconnect", () => {
                    logger.info(
                        `${socket.name}(${socket.userId}) disconnected`,
                    );
                });
            });
        } catch (error) {
            logger.error(error);
        }
    }
}
