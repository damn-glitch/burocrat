import { Text, TouchableOpacity, View } from "react-native";
import { Link } from "expo-router";

export default function Index() {
  return (
    <View
      style={{
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
      }}
    >
      <Link href="/login" asChild>
        <TouchableOpacity >
          <Text>Войти</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register" asChild>
        <TouchableOpacity >
          <Text>Рег</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register/verificationCode" asChild>
        <TouchableOpacity >
          <Text>Вер код</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register/createPassword" asChild>
        <TouchableOpacity >
          <Text>Создание пароля </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/register/userData" asChild>
        <TouchableOpacity >
          <Text>Данные юзера </Text>
        </TouchableOpacity>
      </Link>


      <Link href="/forgotPassword" asChild>
        <TouchableOpacity >
          <Text>забыл пароль  </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/forgotPassword/verificationCode" asChild>
        <TouchableOpacity >
          <Text>забыл пароль - код </Text>
        </TouchableOpacity>
      </Link>

      <Link href="/forgotPassword/createNewPassword" asChild>
        <TouchableOpacity >
          <Text>забыл пароль - новый пароль </Text>
        </TouchableOpacity>
      </Link>


      <Link href="/main" asChild>
        <TouchableOpacity >
          <Text>мэйн</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/main/notifications" asChild>
        <TouchableOpacity >
          <Text>увдеомления</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/main/profile" asChild>
        <TouchableOpacity >
          <Text>Профиль</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/companies" asChild>
        <TouchableOpacity >
          <Text>компании</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/companies/project/[projectID]" asChild>
        <TouchableOpacity >
          <Text>проект</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/companies/project/[projectID]/addTask" asChild>
        <TouchableOpacity >
          <Text>добавить задачу</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/companies/createCompany" asChild>
        <TouchableOpacity >
          <Text>Создать компанию</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/companies/project/allTasks" asChild>
        <TouchableOpacity >
          <Text>Все задачи</Text>
        </TouchableOpacity>
      </Link>
      <Link href="/companies/[companyID]/edit" asChild>
        <TouchableOpacity >
          <Text>Редактировать компанию</Text>
        </TouchableOpacity>
      </Link>


      <Link href="/main/generate" asChild>
        <TouchableOpacity >
          <Text>Генерация документов</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/main/editDocs" asChild>
        <TouchableOpacity >
          <Text>Редактирование документов</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/main/editDocs/[id]" asChild>
        <TouchableOpacity >
          <Text>Детали документа</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/companies/project/createProject" asChild>
        <TouchableOpacity >
          <Text>Создание проекта</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/main/scan/details" asChild>
        <TouchableOpacity >
          <Text>детали скана</Text>
        </TouchableOpacity>
      </Link>

      <Link href="/companies/project/[projectID]/editProject" asChild>
        <TouchableOpacity >
          <Text>редактирование проекта</Text>
        </TouchableOpacity>
      </Link>
    </View>
  );
}
