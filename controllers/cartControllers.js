const { PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


exports.addToCart = async(req, res) => {
    const { productId, quantity } = req.body;
    try {
        let cart = await prisma.cart.findUnique({ where: { userId: req.user.id }})
        if(!cart) {
            cart = await prisma.cart.create({ data: { userId: req.user.id }})
        }
        const product = await prisma.product.findUnique({ where: { id: parseInt(productId)}})
        if(!product) return res.status(400).json({ success: false, message: "Product not found"})

        let cartItems = await prisma.cartItems.findFirst({ where: { cartId: cart.id, productId: product.id}})
        if(cartItems) {
            cartItems = await prisma.cartItems.update({
                where: { id: cartItems.id },
                data: {
                    productId: product.id,
                    quantity: cartItems.quantity + quantity,
                    amount: product.price * ( cartItems.quantity + quantity)
                }

            })
        }else {
            cartItems = await prisma.cartItems.create({
                data: {
                    cartId: cart.id,
                    productId: product.id,
                    quantity,
                    amount: product.price * quantity,
                    paid: false
                }
            })
        }

        return res.status(201).json({ success: true, message: "Product added to cart successfully", products: cartItems })
        
    } catch (error) {
        console.log({ error: error.message })
        return res.status(500).json({ success: false, message: "Internal Server Error"})
    }
}

exports.getCart = async (req, res) => {
    try {
        const carts = await prisma.cart.findUnique({ where: { userId: req.user.id }})
        if(!carts) return res.status(404).json({ success: false, message: "Cart not found"})
        // console.log("cart", carts)
        // console.log("cartid", carts.id)
        const cartItems = await prisma.cartItems.findMany({ where: { cartId: carts.id }, include: { product: true }})
        // console.log("cartItems", cartItems)
        if(!cartItems || cartItems.length < 0) return res.status(404).json({ success: false, message:"cartItems not found"})
        return res.status(200).json({ success: true, message: "cartItems found", products: cartItems })

    } catch (error) {
        console.log({ error: error.message })
        return res.status(500).json({ success: false, message: "Internal Server Error"})
    }
}

// exports.updateCartItem = async (req, res) => {
//     const { productId, quantity } = req.body;
//     try {

//         let cart = await prisma.cart.findUnique({ where: { userId: req.user.id }})
//         if(!cart) {
//             return res.status(404).json({ success: false, message:"Cart not found"})
//         }
//         const product = await prisma.product.findUnique({ where: { id: parseInt(productId)}})
//         if(!product) return res.status(400).json({ success: false, message: "Product not found"})

//         let cartItems = await prisma.cartItems.findFirst({ where: { cartId: cart.id, productId: product.id}})
//         if(cartItems) {
//             cartItems = await prisma.cartItems.update({
//                 where: { id: cartItems.id },
//                 data: {
//                     productId: product.id,
//                     quantity: cartItems.quantity + quantity,
//                     amount: product.price * ( cartItems.quantity + quantity)
//                 }

//             })
//         }
//         return res.status(200).json({ success: true, message: "Product updated in cart successfully", products: cartItems })
        
//     } catch (error) {
//         console.log({ error: error.message })
//         return res.status(500).json({ success: false, message: "Internal Server Error"})
//     }
// }

exports.updateCartItem = async (req, res) => {
    const { productId, quantity } = req.body;
    
    try {
        // Validate quantity
        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: "Invalid quantity" });
        }

        // Find user's cart
        let cart = await prisma.cart.findUnique({ 
            where: { userId: req.user.id }
        });
        
        if (!cart) {
            return res.status(404).json({ success: false, message: "Cart not found" });
        }

        // Verify product exists
        const product = await prisma.product.findUnique({ 
            where: { id: parseInt(productId) }
        });
        
        if (!product) {
            return res.status(404).json({ success: false, message: "Product not found" });
        }

        // Find existing cart item
        let cartItem = await prisma.cartItems.findFirst({ 
            where: { 
                cartId: cart.id, 
                productId: product.id 
            }
        });

        // If item exists in cart, update it
        if (cartItem) {
            cartItem = await prisma.cartItems.update({
                where: { id: cartItem.id },
                data: {
                    quantity: parseInt(quantity), // Set to the new quantity, not adding
                    amount: product.price * parseInt(quantity)
                }
            });
            
            return res.status(200).json({ 
                success: true, 
                message: "Cart item updated successfully", 
                data: cartItem 
            });
        } else {
            return res.status(404).json({ 
                success: false, 
                message: "Item not found in cart" 
            });
        }
        
    } catch (error) {
        console.error("Update cart item error:", error);
        return res.status(500).json({ 
            success: false, 
            message: "Internal Server Error" 
        });
    }
};

exports.deleteCartItems = async(req, res) => {
    const { productId } = req.body;
    try {
        let cart = await prisma.cart.findUnique({ where: { userId: req.user.id }})
        if(!cart) return res.status(404).json({ success: false, message:"Cart not found"})
        
        let cartItems = await prisma.cartItems.findFirst({ where: { cartId: cart.id, productId: parseInt(productId)}})
        if(!cartItems) return res.status(404).json({ success: false, message: "Cart item not found"})

        const deleteCartItems = await prisma.cartItems.delete({ where: { id: cartItems.id }})
        if(!deleteCartItems) return res.status(404).json({ success: false, message: "unable to delete cart items"})
        return res.status(200).json({ success: true, message: "Cart item deleted successfully", products: deleteCartItems })  
    } catch (error) {
        console.log({ error: error.message })
    }
}