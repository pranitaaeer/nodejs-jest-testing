jest.mock("../models/user.models")
jest.mock("bcrypt")
jest.mock("jsonwebtoken")

const user=require("../models/user.models")
const {signup,login,myInfo,logout,userDetails} =require("../controllers/user.controllers")
const bcrypt=require("bcrypt")
const jwt =require("jsonwebtoken")
const { json } = require("express")

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

describe("login controller",()=>{
  test("should return 400 when email and password is missing",async () => {
     const req={
        body:{}
     }
     const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
     }
     await login(req,res)
     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({
        msg:"Email and Password are required !"
     })
     expect(user.findOne).not.toHaveBeenCalled()
  })

  test("should return 400 when user is missing",async () => {
    user.findOne.mockResolvedValue(null)
    const req={
        body:{
            email:"pranu@gmail.com",
            password:"pranu@1434" 
        }
     }
    const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
     }
     await login(req,res)
     expect(user.findOne).toHaveBeenCalledWith({
        email:"pranu@gmail.com"
     })
      expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({
        msg:"Please Signin first !"
     })

  })
  test("should return 400 when password is incorrect",async () => {
    user.findOne.mockResolvedValue({
        _id:"123",
        email:"pranu@gmail.com",
        password:"hashed@123"
    })
    bcrypt.compare.mockResolvedValue(false)
    const req={
        body:{
            email:"pranu@gmail.com",
            password:"pranu@1434" 
        }
     }
    const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
     }
     await login(req,res)
     expect(user.findOne).toHaveBeenCalledWith({email:"pranu@gmail.com"})
     expect(bcrypt.compare).toHaveBeenCalledWith("pranu@1434","hashed@123")
     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({
        msg:"Incorrect credentials !"
     })

  })

  test("should return 400 when Token not generated",async () => {
    user.findOne.mockResolvedValue({
        _id:"123",
        email:"pranu@gmail.com",
        password:"hashed@123"
    })
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue(null)
    const req={
        body:{
            email:"pranu@gmail.com",
            password:"pranu@1434" 
        }
     }
    const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn(),
        cookie:jest.fn()
     }
     await login(req,res)
     expect(user.findOne).toHaveBeenCalledWith({email:"pranu@gmail.com"})
     expect(bcrypt.compare).toHaveBeenCalledWith("pranu@1434","hashed@123")
     expect(jwt.sign).toHaveBeenCalledWith({token:"123"},process.env.JWT_SECRET,{expiresIn:"30d"})
     expect(res.cookie).not.toHaveBeenCalled()
     expect(res.status).toHaveBeenCalledWith(400)
     expect(res.json).toHaveBeenCalledWith({
        msg:"Token not generated in login !"
     })

  })

  test("should return 200 when user login successfully",async () => {
    user.findOne.mockResolvedValue({
        _id:"123",
        email:"pranu@gmail.com",
        password:"hashed@123"
    })
    bcrypt.compare.mockResolvedValue(true)
    jwt.sign.mockReturnValue("accesstoken")
    const req={
        body:{
            email:"pranu@gmail.com",
            password:"pranu@1434" 
        }
     }
    const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn(),
        cookie:jest.fn()
     }
     await login(req,res)
     expect(user.findOne).toHaveBeenCalledWith({email:"pranu@gmail.com"})
     expect(bcrypt.compare).toHaveBeenCalledWith("pranu@1434","hashed@123")
     expect(jwt.sign).toHaveBeenCalledWith({token:"123"},process.env.JWT_SECRET,{expiresIn:"30d"})
     expect(res.cookie).toHaveBeenCalledWith("token","accesstoken",{
      maxAge: 1000 * 60 * 60 * 24 * 30,
      httpOnly: true,
      secure: true,
      sameSite: "none",
    })
     expect(res.status).toHaveBeenCalledWith(200)
     expect(res.json).toHaveBeenCalledWith({
        msg:"User logged in succcessfully !"
     })

  })
  test("should return 500 when internal server err occur",async()=>{
    user.findOne.mockRejectedValue(new Error("Internal server err"))
    const req={
        body:{
            email:"pranu@gmail.com",
            password:"pranu@1434" 
        }
    }

    const res={
        status:jest.fn().mockReturnThis(),
        json:jest.fn()
    }
    await login(req,res)
    expect(res.status).toHaveBeenCalledWith(500)
    expect(res.json).toHaveBeenCalledWith({msg:"Error in login !",err:"Internal server err"})
  })

})

describe("myinfo controller",()=>{
    test("should return 200 when user fetch their info",async()=>{
        const req={
            _id:"123",
            email:"pranu@gmail.com",
            password:"hanshed@123"
        }
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await myInfo(req,res)
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({msg:req.user})

    })

    test("should return 500 when err in fetching myinfo",async()=>{
        const req=null
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await myInfo(req,res)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({msg:"Error in myInfo !"})

    })
})

describe("logout controller",()=>{
    test("should return 200 when user logout",async()=>{
        const req={}
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn(),
            cookie:jest.fn() 
        }
        await logout(req,res)
        expect(res.cookie).toHaveBeenCalledWith("token","",{
            maxAge: 0,
            httpOnly: true,
            sameSite: "none",
            secure: true,
            partitioned: true,
        })
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            msg:"You logged out !"
        })
    })

    test("should return 500 when internal sever err",async()=>{
        const req={}
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await logout(req,res)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            msg:"Error in logout"
        })
    })
})

describe("userDeatils controller",()=>{
    test("should return 400 when id is missing",async () => {
        const req={params:{}}
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await userDetails(req,res)
        expect(res.status).toHaveBeenCalledWith(400)
        expect(res.json).toHaveBeenCalledWith({
            msg:"id is required !"
        })
        expect(user.findById).not.toHaveBeenCalled()
    })

    test("should return 200 when user fetch details",async () => {
        user.findById.mockResolvedValue({
            _id:"123",
            email:"pranu@gmail",
            username:"Pranita Aeer"
        })
        const req={
            params:{
                id:"123"
            }
        }
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await userDetails(req,res)
        expect(user.findById).toHaveBeenCalledWith("123")
        expect(res.status).toHaveBeenCalledWith(200)
        expect(res.json).toHaveBeenCalledWith({
            msg:"User Details Fetched !",
            user:{
            _id:"123",
            email:"pranu@gmail",
            username:"Pranita Aeer"}
        })
    })
    test("should return 500 when internal sever err",async()=>{
        user.findById.mockImplementation( ()=>{throw new Error("Internal Server err")})
        const req={params:{id:"123"}}
        const res={
            status:jest.fn().mockReturnThis(),
            json:jest.fn()
        }
        await userDetails(req,res)
        expect(res.status).toHaveBeenCalledWith(500)
        expect(res.json).toHaveBeenCalledWith({
            msg:"Error in userDetails !",
            err:"Internal Server err"
        })
    })
})