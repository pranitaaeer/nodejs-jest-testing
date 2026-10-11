jest.mock("../models/user.models")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")

const user=require("../models/user.models")
const {signup} =require("../controllers/user.controllers")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")

describe("signup controller",()=>{
    test("should return 400 when user is missing",async ()=>{
        const req={
            body:{}
        }
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await signup(req,res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            msg:"username, email and password are required"
        })
        expect(user.findOne).not.toHaveBeenCalled()
    })

    test("should return 400 when hash password is missing",async () => {
      user.findOne.mockResolvedValue(null);
      bcrypt.hash.mockResolvedValue(null);
        const req={
          body:{
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"pranu@1434" 
            }     
        }

        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }

         await signup(req,res)
       expect(user.findOne).toHaveBeenCalledWith({
        email:"pranu@gmail.com"
       })

        expect(bcrypt.hash).toHaveBeenCalledWith("pranu@1434",10)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            msg:"Error in password hashing !"
        })
       
    })
    test("should return 400 when err occurs in saving user",async () => {
       user.findOne.mockResolvedValue(null)
       bcrypt.hash.mockResolvedValue("hashed@123")
       const mockSave=jest.fn().mockResolvedValue(null)
       user.mockImplementation(()=>({
        save:mockSave
       }))
        const req={
            body:{
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"pranu@1434" 
            } 
        }
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await signup(req,res)
        expect(user.findOne).toHaveBeenCalledWith({
            email:"pranu@gmail.com"
        })
        expect(bcrypt.hash).toHaveBeenCalledWith("pranu@1434",10)
        expect(user).toHaveBeenCalledWith({
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"hashed@123" 
        })
        expect(mockSave).toHaveBeenCalled()
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            msg:"Error while saving user !"
        })
        
    })

    test("should return 400 when token generation fails",async () => {
        user.findOne.mockResolvedValue(null)
        bcrypt.hash.mockResolvedValue("hashed@123")

        user.mockImplementation(()=>({
            save:jest.fn().mockResolvedValue({
                _id:"123",
                userName:"pranita Aeer"
            })
        }))
       
        jwt.sign.mockReturnValue(null) //beacuse jwt is not async fun

        const req={
            body:{
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"pranu@1434"  
            }
        }
        const res={
           status:jest.fn().mockReturnThis(),
           json:jest.fn(),
           cookie:jest.fn()
        }
        
        await signup(req,res)
        expect(jwt.sign).toHaveBeenCalledWith(
            {token:"123"},
            process.env.JWT_SECRET,
            {expiresIn:"30d"}
        )

        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
           msg:"Error while generating token !"
        })
        expect(res.cookie).not.toHaveBeenCalled()

    })
    test("should return 201 when user successfully signup",async () => {
        user.findOne.mockResolvedValue(null)
        bcrypt.hash.mockResolvedValue("hashed@123")
        const mockSave=jest.fn().mockResolvedValue({
                _id:"123",
                userName:"Pranita Aeer"
            })

        user.mockImplementation(()=>({
            save:mockSave
        }))
        jwt.sign.mockReturnValue("pranita@0905")

        const req={
            body:{
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"pranu@1434"
            }
        }
        const res={
           status:jest.fn().mockReturnThis(),
           json:jest.fn(),
           cookie:jest.fn()
        }
        await signup(req,res)
        
        expect(res.cookie).toHaveBeenCalledWith(
            "token",
            "pranita@0905",
           {
            maxAge: 1000 * 60 * 60 * 24 * 30,
            httpOnly: true,
            secure: true,
            sameSite: "none",
          }
        )
        expect(res.status).toHaveBeenCalledWith(201)
        expect(res.json).toHaveBeenCalledWith({
            msg:"User Signed in successfully ! hello Pranita Aeer"
        })
    })
    test("should return 500 when network er occur",async () => {
        user.findOne.mockRejectedValue(new Error("Network Error"))

        const req={
            body:{
            userName:"pranita Aeer",
            email:"pranu@gmail.com",
            password:"pranu@1434"
            }
        }

        const res={
            status:jest.fn().mockReturnThis(),
           json:jest.fn()
        }
        await signup(req,res)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            msg:"Error in signin !",
            err:"Network Error"
        })
    })
})