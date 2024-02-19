import { connectToDB } from "@utils/database";
import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import User from "@models/user";
// console.log({
//   clientId: process.env.GOOGLE_ID,
//   clientSecret: process.env.GOOGLE_CLIENT_SECRET,
// });
const handler = NextAuth({
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
  ],
  callbacks: {
    async session({ session }) {
      // store the user id from MongoDB to session
      const sessionUser = await User.findOne({ email: session.user.email });
      session.user.id = sessionUser._id.toString();

      return session;
    },
    async signIn({ profile }) {
      try {
        //serverless > lamda > dyna
        await connectToDB();
        //check if user exist
        const userExist = await User.findOne({
          email: profile.email,
        });
        // if exist create new user
        if (!userExist) {
          await User.create({
            email: profile.email,
            username: profile.name.replace(" ", "").toLowerCase(),
            image: profile.picture,
          });
        }
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
  },
});

export { handler as GET, handler as POST };
