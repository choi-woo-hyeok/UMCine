import { useState, type FormEvent } from "react";
import { Link } from "@tanstack/react-router";
import { checkEmailDuplicate } from "../../api/members/check-email-duplicate";
import { checkNicknameDuplicate } from "../../api/members/check-nickname-duplicate";
import { useSignupMutation } from "../../hooks/use-signup-mutation";

// 이메일 형식 검사
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// 비밀번호 검사: 8자 이상, 영문 대소문자, 숫자, 특수문자 포함
const PASSWORD_REGEX =
  /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[A-Za-z0-9!@#$%^&*]{8,}$/;

type Field = "email" | "nickname" | "password" | "passwordConfirm";
type CheckField = "email" | "nickname";

const emptyCheck = {
  isChecking: false,
  checkedValue: "",
  isAvailable: false,
};

type CheckState = typeof emptyCheck;

export function SignupPage() {
  // 회원가입 입력값
  const [form, setForm] = useState({
    email: "",
    nickname: "",
    password: "",
    passwordConfirm: "",
  });

  // 이메일, 닉네임 중복 확인 상태
  const [checks, setChecks] = useState<Record<CheckField, CheckState>>({
    email: { ...emptyCheck },
    nickname: { ...emptyCheck },
  });

  const signupMutation = useSignupMutation();
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(false);

  // 입력값 유효성 검사
  const emailValid = EMAIL_REGEX.test(form.email.trim());

  const nicknameValid =
    form.nickname.trim().length >= 2 && form.nickname.trim().length <= 12;

  const passwordValid = PASSWORD_REGEX.test(form.password);

  const confirmValid =
    form.passwordConfirm.length > 0 && form.password === form.passwordConfirm;

  // 중복 확인 성공 여부
  const emailChecked =
    checks.email.isAvailable && checks.email.checkedValue === form.email.trim();

  const nicknameChecked =
    checks.nickname.isAvailable &&
    checks.nickname.checkedValue === form.nickname.trim();

  // 가입하기 버튼 활성화 조건
  const canSubmit =
    emailValid &&
    nicknameValid &&
    passwordValid &&
    confirmValid &&
    emailChecked &&
    nicknameChecked &&
    !signupMutation.isPending &&
    !checks.email.isChecking &&
    !checks.nickname.isChecking;

  // 입력값 변경
  function updateField(field: Field, value: string) {
    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));

    setMessage("");
    setSuccess(false);

    // 이메일이나 닉네임이 변경되면 중복 확인 결과 초기화
    if (field === "email" || field === "nickname") {
      setChecks((prev) => ({
        ...prev,
        [field]: { ...emptyCheck },
      }));
    }
  }

  // 이메일 및 닉네임 중복 확인
  async function checkDuplicate(field: CheckField) {
    const value = form[field].trim();

    if (field === "email" ? !emailValid : !nicknameValid) {
      return;
    }

    if (checks[field].isChecking) {
      return;
    }

    setChecks((prev) => ({
      ...prev,
      [field]: {
        ...emptyCheck,
        isChecking: true,
      },
    }));

    try {
      const response =
        field === "email"
          ? await checkEmailDuplicate(value)
          : await checkNicknameDuplicate(value);

      setChecks((prev) => ({
        ...prev,
        [field]: {
          isChecking: false,
          isAvailable: response.available,
          checkedValue: value,
        },
      }));

      const label = field === "email" ? "이메일" : "닉네임";

      alert(
        response.available
          ? `사용할 수 있는 ${label}이에요.`
          : `이미 사용 중인 ${label}이에요.`,
      );
    } catch {
      setChecks((prev) => ({
        ...prev,
        [field]: { ...emptyCheck },
      }));

      alert("중복 확인에 실패했어요. 회원 서버 실행 상태를 확인해 주세요.");
    }
  }

  // 회원가입 요청은 TanStack Query의 useMutation으로 처리
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit || signupMutation.isPending) return;
    setMessage(""); setSuccess(false);
    signupMutation.mutate({email:form.email.trim(), nickname:form.nickname.trim(),password:form.password}, {
      onSuccess: (response) => {
        if (!response.isSuccess) { setMessage(response.message || "회원가입에 실패했어요."); return; }
        setSuccess(true); setMessage(response.message || "회원가입이 완료되었어요.");
      },
      onError: () => {setSuccess(false);setMessage("회원가입에 실패했어요. 서버 상태를 확인해 주세요.");},
    });
  }

  // 중복 확인 실패 메시지 표시 조건
  // 아직 중복 확인을 하지 않았다면 오류 메시지를 표시하지 않음
  const showEmailDuplicateError =
    checks.email.checkedValue !== "" &&
    checks.email.checkedValue === form.email.trim() &&
    !checks.email.isAvailable;

  const showNicknameDuplicateError =
    checks.nickname.checkedValue !== "" &&
    checks.nickname.checkedValue === form.nickname.trim() &&
    !checks.nickname.isAvailable;

  const inputClass =
    "mt-1 w-full rounded-md border border-gray-300 px-3 py-2 outline-none focus:border-blue-500";

  const buttonClass =
    "rounded-md bg-gray-900 px-3 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-gray-300";

  return (
    <main className="mx-auto max-w-lg px-6 py-14">
      <h1 className="mb-8 text-3xl font-bold">회원가입</h1>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* 이메일 */}
        <div>
          <label htmlFor="signup-email" className="block text-sm font-semibold">
            이메일
          </label>

          <div className="flex gap-2">
            <input
              id="signup-email"
              type="email"
              className={inputClass}
              value={form.email}
              disabled={checks.email.isChecking}
              onChange={(e) => updateField("email", e.target.value)}
              placeholder="example@email.com"
            />

            <button
              type="button"
              className={buttonClass}
              disabled={!emailValid || checks.email.isChecking}
              onClick={() => void checkDuplicate("email")}
            >
              {checks.email.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>

          {form.email && !emailValid && (
            <p className="mt-1 text-xs text-red-600">
              올바른 이메일 형식으로 입력해 주세요.
            </p>
          )}

          {emailChecked && (
            <p className="mt-1 text-xs text-green-600">
              사용 가능한 이메일이에요.
            </p>
          )}

          {showEmailDuplicateError && (
            <p className="mt-1 text-xs text-red-600">
              이미 사용 중인 이메일이에요.
            </p>
          )}
        </div>

        {/* 닉네임 */}
        <div>
          <label
            htmlFor="signup-nickname"
            className="block text-sm font-semibold"
          >
            닉네임
          </label>

          <div className="flex gap-2">
            <input
              id="signup-nickname"
              type="text"
              className={inputClass}
              value={form.nickname}
              disabled={checks.nickname.isChecking}
              onChange={(e) => updateField("nickname", e.target.value)}
              placeholder="2~12자"
            />

            <button
              type="button"
              className={buttonClass}
              disabled={!nicknameValid || checks.nickname.isChecking}
              onClick={() => void checkDuplicate("nickname")}
            >
              {checks.nickname.isChecking ? "확인 중" : "중복 확인"}
            </button>
          </div>

          {form.nickname && !nicknameValid && (
            <p className="mt-1 text-xs text-red-600">
              닉네임은 2~12자여야 해요.
            </p>
          )}

          {nicknameChecked && (
            <p className="mt-1 text-xs text-green-600">
              사용 가능한 닉네임이에요.
            </p>
          )}

          {showNicknameDuplicateError && (
            <p className="mt-1 text-xs text-red-600">
              이미 사용 중인 닉네임이에요.
            </p>
          )}
        </div>

        {/* 비밀번호 */}
        <div>
          <label
            htmlFor="signup-password"
            className="block text-sm font-semibold"
          >
            비밀번호
          </label>

          <input
            id="signup-password"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.password}
            onChange={(e) => updateField("password", e.target.value)}
          />

          <p className="mt-1 text-xs text-gray-500">
            8자 이상, 영문 대소문자·숫자·특수문자 (!@#$%^&*) 각 1개 이상
          </p>

          {form.password && !passwordValid && (
            <p className="mt-1 text-xs text-red-600">
              비밀번호 조건을 확인해 주세요.
            </p>
          )}
        </div>

        {/* 비밀번호 확인 */}
        <div>
          <label
            htmlFor="signup-confirm"
            className="block text-sm font-semibold"
          >
            비밀번호 확인
          </label>

          <input
            id="signup-confirm"
            type="password"
            autoComplete="new-password"
            className={inputClass}
            value={form.passwordConfirm}
            onChange={(e) => updateField("passwordConfirm", e.target.value)}
          />

          {form.passwordConfirm && !confirmValid && (
            <p className="mt-1 text-xs text-red-600">
              비밀번호가 일치하지 않아요.
            </p>
          )}
        </div>

        {/* 가입하기 버튼 */}
        <button
          type="submit"
          disabled={!canSubmit || signupMutation.isPending}
          className="w-full rounded-md bg-blue-600 py-3 font-semibold text-white disabled:cursor-not-allowed disabled:bg-blue-300"
        >
          {signupMutation.isPending ? "가입 중..." : "가입하기"}
        </button>

        {/* 회원가입 결과 */}
        {message && (
          <p
            role="status"
            className={
              success ? "text-sm text-green-700" : "text-sm text-red-600"
            }
          >
            {message}
          </p>
        )}

        {success && (
          <p className="text-sm text-gray-600">
            가입이 완료되었습니다.{" "}
            <Link to="/login" className="text-blue-600 underline">
              로그인 화면으로 이동
            </Link>
          </p>
        )}
      </form>
    </main>
  );
}
