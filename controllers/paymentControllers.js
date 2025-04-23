const { PrismaClient } = require("@prisma/client");
const dotenv = require("dotenv");
const prisma = new PrismaClient();
const { v4: uuidv4 } = require('uuid');
const { connect } = require("../routes/paymentRoutes");

dotenv.config();

exports.initatePayment = async(req, res) => {
    const { fullName, address, email, phone, amount } = req.body;
    const user = req.user;
    try {
        const users = await prisma.user.findUnique({ where: { id: user.id }})
        if(!users) return res.status(400).json({ success: false, message: "user not found"})

        const cart = await prisma.cart.findUnique({ where: { userId: user.id }});
        if(!cart){
            return res.status(400).json({ success: false, message: "Cart not found or cart empty"})
        }


        const orderId = uuidv4();
        const paymentData = {
            tx_ref: orderId,
            amount,
            fullName,
            phone,
            email,
            address,
            currency: 'NGN',
            redirect_url: `http://localhost:5173/thankyou`,
            // redirect_url: `http://localhost:8000/api/verify-payment`,
            // redirect_url: `${process.env.FRONTEND_URL}/verify-payment`,
            meta: {
                fullName, phone, address, email
            },
            customer: {
                email: user.email,
                name: user.firstName,
                phonenumber: phone,
            },
            customizations: {
                title: 'VeeStores Standard Payment',
                description: "Verified Payment"
            }
        }

        const response = await fetch("https://api.flutterwave.com/v3/payments", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
                "Content-Type": "application/json"
            }, 
            body: JSON.stringify(paymentData)
        });

        const data = await response.json();
        if(data.status === "success"){
            return res.status(200).json({ success: true, data: data.data.link})
        } else {
            return res.status(400).json({ 
                success: false, 
                message: data.message || "Unable to generate payment link"
            })
        }
        
    } catch (error) {
        console.log({ error: error.message })
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server error"
        })
    }
}

exports.verifyPayment = async (req, res) => {
    const { transaction_id, orderId } = req.body;
    try {
        const response = await fetch(`https://api.flutterwave.com/v3/transactions/${transaction_id}/verify`, {
            method: "GET",
            headers: {
                Authorization: `Bearer ${process.env.FLW_SECRET_KEY}`,
            }
        })
        const data = await response.json();
        console.log("Data: ", data);
        if(data.status === "success"){
            const cart = await prisma.cart.findUnique({ 
                where: { userId: req.user.id },
                include: { cartItems: true }
            });
            if(!cart){
                return res.status(400).json({ success: false, message: "Cart not found or cart empty"})
            }

            const order = await prisma.order.create({ data: {
                user: { connect: { id: req.user.id }},
                orderId,
                email: data.data.meta.email,
                fullName: data.data.meta.fullName,
                address: data.data.meta.address,
                phone: data.data.meta.phone,
                amount: data.data.amount,
                status: "COMPLETED",
                transactionId: transaction_id,
                orderItems: { 
                    create: cart.cartItems.map((items) => ({
                        products: { connect: {id: items.productId} },
                        quantity: items.quantity,
                        amount: items.amount, 
                        paid: true
                    }))
                }
            }, include: { user: true, orderItems: { include: { products: true }} }})

            await prisma.cartItems.deleteMany({ where: { cartId: cart.id }})
            return res.status(201).json({ success: true, message: "Order Created Successfully", data: order })
        }else{
            res.status(400).json({ success: false, message: "Unable to verify payment"})
        }

        
    } catch (error) {
        console.log({ error: error.message })
        return res.status(500).json({ success: false, message: "internal server error"})
    }
}

