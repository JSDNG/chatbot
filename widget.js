(function () {
    // Kiểm tra xem widget đã được tải chưa để tránh tải nhiều lần
    if (window.chatbotWidgetLoaded) return;
    window.chatbotWidgetLoaded = true;

    // Xác định website ID từ trang cha hoặc từ tên miền hiện tại
    var websiteId = window.chatbotWebsiteId || "default";

    // Nếu không có website ID cụ thể, thử xác định từ hostname
    if (websiteId === "default") {
        var hostname = window.location.hostname.toLowerCase();
        if (hostname.includes("supover")) {
            websiteId = "supover";
        } else if (hostname.includes("pressify")) {
            websiteId = "pressify";
        }
    }

    console.log("Detected website ID:", websiteId);

    // Tạo stylesheet để nhúng vào trang
    var styleTag = document.createElement("style");
    styleTag.textContent = `
  .widget-iframe-container {
    position: fixed;
    bottom: 90px;
    right: 35px;
    z-index: 999999;
    display: none;
    width: 420px;
    height: 600px;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 0 128px 0 rgba(0,0,0,0.1),
                0 32px 64px -48px rgba(0,0,0,0.5);
    transition: all 0.1s ease;
    transform-origin: bottom right;
    transform: scale(0.5);
    opacity: 0;
  }
  
  .widget-iframe-container.active {
    transform: scale(1);
    opacity: 1;
  }
  
  .widget-iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  
  .widget-button {
    position: fixed;
    bottom: 30px;
    right: 35px;
    z-index: 1000000;
    width: 50px;
    height: 50px;
    border-radius: 50%;
    background-color: #724ae8;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    box-shadow: 0 0 10px rgba(0,0,0,0.1);
    transition: transform 0.2s ease;
  }
  
  .widget-button.active {
    transform: rotate(90deg);
  }
  
  .widget-chat-icon, .widget-close-icon {
    color: white;
    font-size: 24px;
    font-family: 'Material Symbols Rounded', sans-serif;
  }
  
  .widget-button .widget-close-icon {
    display: none;
  }
  
  .widget-button.active .widget-chat-icon {
    display: none;
  }
  
  .widget-button.active .widget-close-icon {
    display: block;
  }
  
  @media (max-width: 490px) {
    .widget-iframe-container {
      right: 0;
      bottom: 0;
      width: 100%;
      height: 100%;
      border-radius: 0;
    }
    
    .widget-button {
      right: 20px;
      bottom: 20px;
    }
  }
`;
    document.head.appendChild(styleTag);

    // Tải Material Symbols nếu chưa có
    function loadMaterialIcons() {
        var linkOutlined = document.createElement("link");
        linkOutlined.rel = "stylesheet";
        linkOutlined.href =
            "https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@48,400,0,0";
        document.head.appendChild(linkOutlined);

        var linkRounded = document.createElement("link");
        linkRounded.rel = "stylesheet";
        linkRounded.href =
            "https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@48,400,1,0";
        document.head.appendChild(linkRounded);
    }
    loadMaterialIcons();

    // Tạo container cho iframe
    var iframeContainer = document.createElement("div");
    iframeContainer.className = "widget-iframe-container";

    // Tạo iframe để hiển thị trang chatbot - thêm tham số website ID
    var iframe = document.createElement("iframe");
    iframe.className = "widget-iframe";
    iframe.src = "https://chatbot.thisistool.com/?website=" + encodeURIComponent(websiteId);
    iframeContainer.appendChild(iframe);

    // Tạo nút toggle
    var button = document.createElement("div");
    button.className = "widget-button";
    button.innerHTML = `
  <span class="widget-chat-icon material-symbols-rounded">mode_comment</span>
  <span class="widget-close-icon material-symbols-outlined">close</span>
`;

    // Thêm các phần tử vào trang
    document.body.appendChild(iframeContainer);
    document.body.appendChild(button);

    // Xử lý sự kiện toggle
    button.addEventListener("click", function () {
        var isOpen = button.classList.contains("active");

        if (isOpen) {
            button.classList.remove("active");
            iframeContainer.classList.remove("active");
            setTimeout(function () {
                iframeContainer.style.display = "none";
            }, 100);
        } else {
            button.classList.add("active");
            iframeContainer.style.display = "block";
            // Trick để kích hoạt animation
            setTimeout(function () {
                iframeContainer.classList.add("active");
            }, 10);

            // Liên lạc với iframe để thông báo nó đã được mở trong widget
            try {
                iframe.contentWindow.postMessage(
                    {
                        action: "widgetOpened",
                        websiteId: websiteId,
                    },
                    "*"
                );
            } catch (e) {
                console.error("Error communicating with iframe:", e);
            }
        }
    });

    // Lắng nghe thông điệp từ iframe (để iframe có thể đóng widget)
    window.addEventListener("message", function (event) {
        if (event.data === "closeWidget") {
            button.classList.remove("active");
            iframeContainer.classList.remove("active");
            setTimeout(function () {
                iframeContainer.style.display = "none";
            }, 100);
        }
    });

    // Xử lý responsive
    function handleResize() {
        if (window.innerWidth <= 490) {
            iframeContainer.style.width = "100%";
            iframeContainer.style.height = "100%";
            iframeContainer.style.right = "0";
            iframeContainer.style.bottom = "0";
            iframeContainer.style.borderRadius = "0";
        } else {
            iframeContainer.style.width = "420px";
            iframeContainer.style.height = "600px";
            iframeContainer.style.right = "35px";
            iframeContainer.style.bottom = "90px";
            iframeContainer.style.borderRadius = "15px";
        }
    }

    window.addEventListener("resize", handleResize);
    handleResize();
})();
