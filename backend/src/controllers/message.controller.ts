import { Request, Response } from "express";
import prisma from "../db/prisma.js";
import { log } from "console";

 export const getUsersForSidebar = async (req: Request, res: Response): Promise<void> => {
    try {
      const authUserId = req.user.id; // Assuming you have the authenticated user's ID from the request
      const users = await prisma.user.findMany({
        where:{
          id:{
            not: authUserId,
          }
        },
        select:{
          fullName: true,
          profilePic: true,
          id: true,
        }
      });
      res.status(200).json(users);
    } catch (error : any) {
      console.log("Error in getUsersForSidebar controller", error.message);
      res.status(500).json({ error: "Failed to get users" });
    }
  };  

  export const getMessages = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id:userToChatId } = req.params;
        const senderId = req.user.id; // Assuming you have the sender's ID from the request
        let conversations = await prisma.conversation.findFirst({
          where: {
            participantIds: {
                hasEvery: [senderId, userToChatId],
            }
          } ,
          include:{
            messages:{
              orderBy:{
                createdAt: "asc",
              }
            }
          }
        });
        if (!conversations) {
          res.status(200).json([])
          return
        }
        res.json(conversations.messages);
    } catch (error : any) {
        console.log("Error in getMessages controller", error.message);
        
      res.status(500).json({ error: "Failed to get messages" });
        
    }
  }
 export const sendMessage = async (req: Request, res: Response): Promise<void> => {
    try {
        const { message } = req.body;
        const { id : receiverId } = req.params;
        const senderId = req.user.id; // Assuming you have the sender's ID from the request
        let conversations = await prisma.conversation.findFirst({
          where: {
            participantIds: {
                hasEvery: [senderId, receiverId],
            }
          }
        });

        if (!conversations) {
            conversations = await prisma.conversation.create({
                data: {
                    participantIds: {
                        set: [senderId, receiverId],
                    }
                }
            });
        }

        const newMessage = await prisma.message.create({
            data: {
                senderId,
                body: message,
                conversationId: conversations.id,
            }
        })
        if(newMessage){
          conversations = await prisma.conversation.update({
            where: { id: conversations.id },
             data: {
              messages:{
                connect: { id: newMessage.id },
              }
             }       
           })
        }
        res.status(200).json({ message: "Message sent successfully", newMessage });
        // handle scket.io event here

    } catch (error : any) {
        console.log( " Error in sendMessage controller", error.message);
        
      res.status(500).json({ error: "Failed to send message" });
    }
  }