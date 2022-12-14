import { supabase } from "~/supabase.server";

export const createUser = async (data) => {
  const { user, error } =
    await supabase.auth.signUp({
      email: data?.email,
      password: data?.password,
    });
  const createProfile = await supabase
    .from("profiles")
    .upsert({
      id: user?.id,
      first_name: data?.firstName,
      last_name: data?.lastName,
      phone_number: data?.phoneNumber,
    });
  return { user: createProfile, error };
};
export const signInUser = async ({
  email,
  password,
}) => {
  const { data, error } =
    await supabase.auth.signIn({
      email,
      password,
    });
  return { data, error };
};
import supabaseToken from "~/utils/cookie";

const getToken = async (request) => {
  const cookieHeader =
    request.headers.get("Cookie");
  return await supabaseToken.parse(cookieHeader);
};

const getUserByToken = async (token) => {
  supabase.auth.setAuth(token);
  const { user, error } =
    await supabase.auth.api.getUser(token);
  return { user, error };
};

export const isAuthenticated = async (
  request,
  validateAndReturnUser = false
) => {
  const token = await getToken(request);
  if (!token && !validateAndReturnUser)
    return false;
  if (validateAndReturnUser) {
    const { user, error } = await getUserByToken(
      token
    );
    if (error) {
      return false;
    }
    return { user };
  }
  return true;
};

export const getUserData = async (userId) => {
  const { data, error } = await supabase
    .from("profiles")
    .select()
    .eq("id", userId)
    .single();
  return { data, error };
};
export const signOutUser = async (request) => {
  const token = await getToken(request);
  return await supabase.auth.api.signOut(token);
};