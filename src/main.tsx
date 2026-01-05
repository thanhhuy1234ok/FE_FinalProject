import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App, ConfigProvider } from "antd";
import { RouterProvider } from "react-router-dom";
import router from "./routers/router";
import viVN from "antd/locale/vi_VN";
import "./styles/global.scss";
import { AppProvider } from "./context/app.provider";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App>
      <AppProvider>
        <ConfigProvider locale={viVN}>
          <RouterProvider router={router} />
        </ConfigProvider>
      </AppProvider>
    </App>
  </StrictMode>
);
