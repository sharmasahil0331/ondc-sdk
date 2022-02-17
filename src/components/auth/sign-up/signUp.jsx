import React, { useState } from "react";
import Button from "../../shared/button/button";
import ErrorMessage from "../../shared/error-message/errorMessage";
import Input from "../../shared/input/input";
import Toast from "../../shared/toast/toast";
import AuthActionCard from "../auth-action-card/authActionCard";
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
} from "firebase/auth";
import styles from "../../../styles/auth/auth.module.scss";
import { buttonTypes } from "../../../utils/button";
import { Link, useHistory } from "react-router-dom";
import { toast_types } from "../../../utils/toast";
import Cookies from "js-cookie";
import { getErrorMessage } from "../../../utils/mapFirebaseError";

export default function SignUp() {
  const auth = getAuth();
  const provider = new GoogleAuthProvider();
  const history = useHistory();
  const [email, setEmail] = useState();
  const [password, setPassword] = useState();
  const [signUpUsingGoogleloading, setSignUpUsingGoogleLoading] =
    useState(false);
  const [
    signUpUsingEmailAndPasswordloading,
    setSignUpUsingEmailAndPasswordLoading,
  ] = useState(false);
  const [toast, setToast] = useState({
    toggle: false,
    type: "",
    message: "",
  });
  const [inlineError, setInlineError] = useState({
    email_error: "",
    password_error: "",
  });
  // use this function to check the email
  function checkEmail() {
    if (!email) {
      setInlineError((inlineError) => ({
        ...inlineError,
        email_error: "email cannot be empty",
      }));
      return false;
    }
    return true;
  }

  function checkPassword() {
    if (!password) {
      setInlineError((inlineError) => ({
        ...inlineError,
        password_error: "password cannot be empty",
      }));
      return false;
    }

    return true;
  }

  function handleSignUpWithEmailAndPassword() {
    const allCheckPassed = [checkEmail(), checkPassword()].every(Boolean);
    if (!allCheckPassed) {
      return;
    }
    setSignUpUsingEmailAndPasswordLoading(true);
    createUserWithEmailAndPassword(auth, email, password)
      .then((result) => {
        handleRedirect(result.user);
      })
      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = getErrorMessage(errorCode);
        setToast((toast) => ({
          ...toast,
          toggle: true,
          type: toast_types.error,
          message: errorMessage,
        }));
      })
      .finally(() => setSignUpUsingEmailAndPasswordLoading(false));
  }
  function handleSignUpWithGoogle() {
    setSignUpUsingGoogleLoading(true);
    signInWithPopup(auth, provider)
      .then((result) => {
        handleRedirect(result.user);
      })
      .catch((error) => {
        const errorMessage = error.message;
        setToast((toast) => ({
          ...toast,
          toggle: true,
          type: toast_types.error,
          message: errorMessage,
        }));
      })
      .finally(() => setSignUpUsingGoogleLoading(false));
  }
  function handleRedirect(user) {
    const { displayName, email, photoURL, accessToken } = user;
    const cookie_expiry_time = new Date();
    cookie_expiry_time.setTime(cookie_expiry_time.getTime() + 3600 * 1000); // expires in 1 hour
    Cookies.set("token", accessToken, {
      expires: cookie_expiry_time,
    });
    Cookies.set(
      "user",
      JSON.stringify({ name: displayName, email, photoURL }),
      {
        expires: cookie_expiry_time,
      }
    );
    history.push("/application");
  }
  const signUpForm = (
    <div className={styles.auth_form}>
      {toast.toggle && (
        <Toast
          type={toast.type}
          message={toast.message}
          onRemove={() =>
            setToast((toast) => ({
              ...toast,
              toggle: false,
            }))
          }
        />
      )}
      <Input
        id="email"
        name="email"
        type="email"
        placeholder="Enter Email"
        label_name="Email"
        autoComplete="off"
        has_error={inlineError.email_error}
        onChange={(event) => {
          setEmail(event.target.value);
          setInlineError((inlineError) => ({
            ...inlineError,
            email_error: "",
          }));
        }}
      />
      {inlineError.email_error && (
        <ErrorMessage>{inlineError.email_error}</ErrorMessage>
      )}
      <Input
        id="password"
        name="password"
        type="password"
        placeholder="Enter Password"
        label_name="Password"
        autoComplete="off"
        has_error={inlineError.password_error}
        onChange={(event) => {
          setPassword(event.target.value);
          setInlineError((inlineError) => ({
            ...inlineError,
            password_error: "",
          }));
        }}
      />
      {inlineError.password_error && (
        <ErrorMessage>{inlineError.password_error}</ErrorMessage>
      )}
      <div className="py-3 text-center">
        <Button
          isloading={signUpUsingEmailAndPasswordloading ? 1 : 0}
          disabled={
            signUpUsingGoogleloading || signUpUsingEmailAndPasswordloading
          }
          button_type={buttonTypes.primary}
          button_hover_type={buttonTypes.primary_hover}
          button_text="Sign up"
          onClick={handleSignUpWithEmailAndPassword}
        />
      </div>
      <hr style={{ margin: "5px 0", border: "1px solid #ddd" }} />
      <div className="py-3 text-center">
        <Button
          isloading={signUpUsingGoogleloading ? 1 : 0}
          disabled={
            signUpUsingGoogleloading || signUpUsingEmailAndPasswordloading
          }
          button_type={buttonTypes.primary}
          button_hover_type={buttonTypes.primary_hover}
          button_text="Sign up with google"
          onClick={handleSignUpWithGoogle}
        />
      </div>
    </div>
  );
  const navigation_link = (
    <div className="py-2 text-center">
      <p className={styles.navigation_link_label}>Already have an account</p>
      <Link to="/login" className={styles.navigation_link}>
        Sign In
      </Link>
    </div>
  );
  return (
    <AuthActionCard
      action_form={signUpForm}
      navigation_link={navigation_link}
    />
  );
}
