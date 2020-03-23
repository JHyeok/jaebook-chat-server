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
    private peopleCounter: number = 0;

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
                const chatDisplayName: string = this.createChatDisplayName(10);
                socket.name = chatDisplayName;
                socket.userId = chatDisplayName;
                this.peopleCounter++;
                logger.info(`Connected client on port ${port}`);

                socket.on("join", () => {
                    logger.info(
                        `chat join: ${socket.name}(${socket.userId}), now people: ${this.peopleCounter}`,
                    );

                    this.io.emit("chatPeople", this.peopleCounter);
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
                    if (
                        socket.name !== undefined &&
                        socket.userId !== undefined
                    ) {
                        this.peopleCounter--;
                    }

                    logger.info(
                        `${socket.name}(${socket.userId}) disconnected`,
                    );

                    this.io.emit("chatPeople", this.peopleCounter);
                });
            });
        } catch (error) {
            logger.error(error);
        }
    }

    private createChatDisplayName(length: number): string {
        let result = "";
        const characters =
            "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
        const charactersLength = characters.length;

        for (let i = 0; i < length; i++) {
            result += characters.charAt(
                Math.floor(Math.random() * charactersLength),
            );
        }

        return result;
    }
}
