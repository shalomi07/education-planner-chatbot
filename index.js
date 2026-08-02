// cara run: node namafile.js
/*
string ---> "Halo", 'halo', `halo`
` ` ---> bisa sematkan variable
object ---> {varname: value}
array ---> [value1, value2, value3...
 */

// tadi utk API, git init, lalu npm init -y ( di terminal)
import {GoogleGenAI} from "@google/genai";
import express from "express";
import multer from "multer";
import cors from "cors";
import "dotenv/config";

// bootstrap GoogleGenAI
const app = express();
const upload = multer();
const ai = new GoogleGenAI({});

app.use(express.static("public"));
app.use(cors()); // agar bisa diakses dari domain lain
app.use(express.json()); // express.json => method chaining (e.g: console.log, ai.interactions.create, dll)
// bootstrap aplikasi express

// route handling
app.get('/', (req, res) => {
    console.log("Akses masuk: '/");
    res.json({message: "Halo, ini server express + Google Gemini API"});
});

app.post('/generate-from-image', async (req, res) => {
    const { prompt } = req.body; // object destructuring, ambil prompt dari req.body
    // jadi misal prompt = "Buatkan saya gambar kucing lucu", maka req.body = {prompt: "Buatkan saya gambar kucing lucu"}
    const base64Image = req.file?.buffer.toString('base64'); // optional method chaining: tujuannya jika tidak sesuai tipe data akan stop sebelum bagian ini, jadi tidak error
    const imageMimeType = req.file?.mimetype; 
    try{
        const aiResponse = await ai.interactions.create({
            model: "gemini-3.6-flash",
            input: [
                {type: "text", text: prompt},
                {type: "image", data: base64Image, mime_type: imageMimeType}
                ],
            });
            res.status(200).json({result: aiResponse.output_text});
    } catch (e) {
        console.log(e);
        res.status(500).json({message: "Terjadi kesalahan saat memproses permintaan."});
    }
    // try: kita coba jalankan kodingan dalam kotak/block pertama
    // catch: kita tangkap error yg ditimbulkan di proses try  
    


});

app.post('/chat', async (req, res) => {
    const{conversation, interactionId} = req.body;
    // conversation ==> array of objects {{}} 
    try {
        //cek apakah array atau bukan
        if(!Array.isArray(conversation)){
            return res.status(400).json({message: "conversation harus berupa array"}); // mengatur status code 400 (bad request) jika conversation bukan array
        }


        const payload = {
            // conversation harus berisi --> {role: 'user | 'model', type: 'text', text: '<isi teksnya>'}
            input: conversation,
            model: "gemma-4-26b-a4b-it",
            //role: "user", type: "text", text: " "
            generation_config: {
                temperature: 0.9,
                top_p: 0.9,
            },
            system_instruction: "Jawab dengan bahasa Indonesia dan dalam intonasi yang sopan"
        };

        if(interactionId){
            payload.previous_interaction_id = interectionId;
        }

        const aiResponse = await ai.interactions.create(payload);
            
    
        return res.status(200).json({result: aiResponse.output_text, interactionId: aiResponse.interaction_id});

    } catch (e) {
        console.log(e);
        return res.status(500).json({message: "Terjadi kesalahan saat memproses permintaan di server kami."});
    }
});

// ada app.get(), app.post(), app.patch(), app.put(), app.delete()
// setup & serve

const PORT = 3001; // utk bedakan const & var const biasa, port dikapital, var biasa lowercase
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});

/*
const interaction = await ai.interactions.create({
    model: "gemini-3.6-flash",
    input: "siapa namamu?"
});
console.log(interaction.output_text);
*/