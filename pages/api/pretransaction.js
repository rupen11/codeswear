const https = require('https');
const PaytmChecksum = require('paytmchecksum');
import connectDb from '../../middleware/mongoose';
import Order from '../../models/Order';
const jwt = require('jsonwebtoken');

const handler = async (req, res) => {

    if (req.method === "POST") {
        try {
            // Store Order
            const user = jwt.verify(req.headers.token, process.env.JWT_SECRETKEY);
            if (!user) return res.status(500).json({ success: false, error: "User not valid" });

            const order = new Order({
                userId: user.id,
                name: req.body.name,
                email: req.body.email,
                pincode: req.body.pincode,
                phone: req.body.phone,
                orderId: req.body.oid,
                products: req.body.cart,
                address: req.body.address,
                amount: req.body.subtotal
            });

            const saveOrder = await order.save();
            if (!saveOrder) return res.status(400).json({ success: false, error: "Order not placed" });
            return res.status(200).json({ success: true, order: saveOrder });
        }
        catch (error) {
            return res.status(400).json({ success: false, error });
        }

        // Paytm payment gateway
        // var paytmParams = {};

        // paytmParams.body = {
        //     "requestType": "Payment",
        //     "mid": process.env.NEXT_PUBLIC_PAYTM_MID,
        //     "websiteName": "YOUR_WEBSITE_NAME",
        //     "orderId": req.body.oid,
        //     "callbackUrl": `${process.env.NEXT_PUBLIC_HOST}/api/posttransaction`,
        //     "txnAmount": {
        //         "value": req.body.subtotal,
        //         "currency": "INR",
        //     },
        //     "userInfo": {
        //         "custId": req.body.email,
        //     },
        // };

        /*
        * Generate checksum by parameters we have in body
        * Find your Merchant Key in your Paytm Dashboard at https://dashboard.paytm.com/next/apikeys
        */
        // const checksum = PaytmChecksum.generateSignature(JSON.stringify(paytmParams.body), process.env.PAYTM_MKEY)

        // paytmParams.head = {
        //     "signature": checksum
        // };

        // const requestAsync = () => {
        //     return new Promise((resolve, reject) => {

        //         var post_data = JSON.stringify(paytmParams);

        //         var options = {

        //             /* for Staging */
        //             // hostname: 'securegw-stage.paytm.in',

        //             /* for Production */
        //             hostname: 'securegw.paytm.in',

        //             port: 443,
        //             path: `/theia/api/v1/initiateTransaction?mid=${NEXT_PUBLIC_PAYTM_MID}&orderId=${req.body.oid}`,
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json',
        //                 'Content-Length': post_data.length
        //             }
        //         };

        //         var response = "";
        //         var post_req = https.request(options, function (post_res) {
        //             post_res.on('data', function (chunk) {
        //                 response += chunk;
        //             });

        //             post_res.on('end', function () {
        //                 console.log('Response: ', response);
        //                 resolve(JSON.parse(response.body));
        //             });
        //         });

        //         post_req.write(post_data);
        //         post_req.end();
        //     })
        // }

        // const myr = await requestAsync();
        // return res.status(200).json(myr);
    }
    else {
        return res.status(400).json({ error: "Method is not allowed" });
    }
}

export default connectDb(handler);
