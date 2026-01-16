import jwt from 'jsonwebtoken';

// Login Seller : /api/seller/login

export const sellerLogin = async (req, res)=>{
    try {
        const { email, password } = req.body;

    if(password === process.env.SELLER_PASSWORD && email === process.env.SELLER_EMAIL){
        const token = jwt.sign({email}, process.env.JWT_SECRET, {expiresIn: '7d'})

        const cookieOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
            maxAge: 7 * 24 * 60 * 60 * 1000,
        };

        res.cookie('sellerToken', token, cookieOptions);

        return res.json({ success: true, message: "Logged In"});
    } else {
        return res.json({ success: false, message: "Invalid Credentials" });
    }
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}

// Check Seller Auth : /api/seller/is-auth
export const isSellerAuth = async (req, res) => {
    try {
        return res.json({success: true})
    } catch (error) {
        console.log(error.message);
        res.json({ success: false, message: error.message });
    }
}

// Logout Seller : /api/seller/logout
export const sellerLogout = async (req, res)=>{
    try{
        const clearOptions = {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'none',
        };

        res.clearCookie('sellerToken', clearOptions);
        return res.json({success: true, message: "Logged Out"})
    } catch (error) {
        console.log(error.message);
        res.json({success: false, message: error.message});
    }
}