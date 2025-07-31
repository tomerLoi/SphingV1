SPHINGV1/
│
├── client/                   # Frontend - React
│   ├── node_modules/
│   ├── public/
│   └── src/
│       ├── api/
│       │   ├── alerts.js
│       │   ├── auth.js
│       │   ├── members.js
│       │   ├── profile.js
│       │   └── sites.js
│       ├── assets/
│       │   ├── images/
│       │   │   └── sphing_logo.png
│       │   └── styles/
│       │       ├── addmember.css
│       │       ├── alerts.css
│       │       ├── dashboard.css
│       │       ├── global.css
│       │       ├── login.css
│       │       ├── navbar.css
│       │       ├── siteform.css
│       │       └── teammembers.css
│       ├── components/
│       │   ├── AddMemberForm/
│       │   │   └── AddMemberForm.jsx
│       │   ├── AddSiteForm/
│       │   │   └── AddSiteForm.jsx
│       │   ├── Alerts/
│       │   │   ├── AlertDropdown.jsx
│       │   │   ├── AlertList.jsx
│       │   │   └── AlertsSidebar.jsx
│       │   ├── EditSiteForm/
│       │   │   └── EditSiteForm.jsx
│       │   ├── LoginForm/
│       │   │   └── LoginForm.jsx
│       │   ├── MemberForm/
│       │   │   └── MemberForm.jsx
│       │   ├── MemberTable/
│       │   │   └── MemberTable.jsx
│       │   ├── Navbar/
│       │   │   └── Navbar.jsx
│       │   ├── PingStatus/
│       │   │   └── PingStatus.jsx
│       │   ├── PortalMenu/
│       │   │   └── PortalMenu.jsx
│       │   ├── SiteCard/
│       │   │   └── SiteCard.jsx
│       │   ├── SiteForm/
│       │   │   ├── SiteForm.jsx
│       │   │   └── EditSiteTab.jsx
│       │   ├── SiteList/
│       │   │   ├── SiteList.jsx
│       │   │   └── SiteRow.jsx
│       │   ├── TeamTable/
│       │   │   └── TeamTable.jsx
│       │   └── PrivateRoute.jsx
│       ├── pages/
│       │   ├── AddMember.jsx
│       │   ├── AddSite.jsx
│       │   ├── Alerts.jsx
│       │   ├── Dashboard.jsx
│       │   ├── EditSite.jsx
│       │   ├── Login.jsx
│       │   ├── ProfilePage.jsx
│       │   ├── SiteManage.jsx
│       │   └── TeamMembers.jsx
│       ├── utils/
│       ├── App.css
│       ├── App.jsx
│       ├── App.test.js
│       ├── config.js
│       ├── index.css
│       ├── index.js
│       ├── index.jsx
│       ├── logo.svg
│       ├── reportWebVitals.js
│       └── setupTests.js
│   ├── .gitignore
│   ├── package.json
│   ├── package-lock.json
│   └── README.md
│
├── core/                     # Backend - Django app
│   ├── management/
│   │   └── commands/
│   │       ├── create_test_user.py
│   │       ├── insert_random_location.py
│   │       └── load_mock_data.py
│   ├── migrations/
│   │   ├── __init__.py
│   │   ├── 0001_initial.py
│   │   ├── 0002_alert_success_rate.py
│   │   └── 0003_log.py
│   ├── __init__.py
│   ├── admin.py
│   ├── apps.py
│   ├── logic.py
│   ├── models.py
│   ├── serializers.py
│   ├── tests.py
│   ├── urls.py
│   └── views.py
│
├── sphingv1_project/         # Django project settings
│   ├── __init__.py
│   ├── asgi.py
│   ├── settings.py
│   ├── urls.py
│   └── wsgi.py
│
├── db.sqlite3                # Database (SQLite - dev only)
├── instruction.md
├── manage.py
├── ping_30.ps1
├── planning.txt
├── requirements.txt
└── setup_and_run.ps1



# Getting Started with Create React App

This project was bootstrapped with [Create React App](https://github.com/facebook/create-react-app).

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.\
Open [http://localhost:3000](http://localhost:3000) to view it in your browser.

The page will reload when you make changes.\
You may also see any lint errors in the console.

### `npm test`

Launches the test runner in the interactive watch mode.\
See the section about [running tests](https://facebook.github.io/create-react-app/docs/running-tests) for more information.

### `npm run build`

Builds the app for production to the `build` folder.\
It correctly bundles React in production mode and optimizes the build for the best performance.

The build is minified and the filenames include the hashes.\
Your app is ready to be deployed!

See the section about [deployment](https://facebook.github.io/create-react-app/docs/deployment) for more information.

### `npm run eject`

**Note: this is a one-way operation. Once you `eject`, you can't go back!**

If you aren't satisfied with the build tool and configuration choices, you can `eject` at any time. This command will remove the single build dependency from your project.

Instead, it will copy all the configuration files and the transitive dependencies (webpack, Babel, ESLint, etc) right into your project so you have full control over them. All of the commands except `eject` will still work, but they will point to the copied scripts so you can tweak them. At this point you're on your own.

You don't have to ever use `eject`. The curated feature set is suitable for small and middle deployments, and you shouldn't feel obligated to use this feature. However we understand that this tool wouldn't be useful if you couldn't customize it when you are ready for it.

## Learn More

You can learn more in the [Create React App documentation](https://facebook.github.io/create-react-app/docs/getting-started).

To learn React, check out the [React documentation](https://reactjs.org/).

### Code Splitting

This section has moved here: [https://facebook.github.io/create-react-app/docs/code-splitting](https://facebook.github.io/create-react-app/docs/code-splitting)

### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
