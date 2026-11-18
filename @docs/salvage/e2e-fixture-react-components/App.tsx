import React from "react";
import ReactDOM from "react-dom/client";
import Button from "@ownui/button";

const App = () => {
    const [theme, setTheme] = React.useState<string>("light");

    return (
        <div className="min-h-screen p-8">
            <h1 className="text-3xl font-bold mb-6">OwnUI Button + tw-theme Test</h1>
            
            {/* Theme Switcher */}
            <div className="mb-8 flex gap-2">
                <button 
                    onClick={() => setTheme("light")} 
                    className="px-4 py-2 bg-gray-200 rounded"
                    id="theme-light"
                >
                    Light Theme
                </button>
                <button 
                    onClick={() => setTheme("dark")} 
                    className="px-4 py-2 bg-gray-700 text-white rounded"
                    id="theme-dark"
                >
                    Dark Theme
                </button>
                <button 
                    onClick={() => setTheme("brand")} 
                    className="px-4 py-2 bg-purple-600 text-white rounded"
                    id="theme-brand"
                >
                    Brand Theme
                </button>
            </div>

            {/* Test Section */}
            <div data-theme={theme} className="space-y-6">
                <section>
                    <h2 className="text-xl font-semibold mb-3">Default Button with Theme Colors</h2>
                    <Button id="btn-primary" className="bg-primary text-primary-content">
                        Primary Button
                    </Button>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Secondary Color</h2>
                    <Button id="btn-secondary" className="bg-secondary text-secondary-content">
                        Secondary Button
                    </Button>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Accent Color</h2>
                    <Button id="btn-accent" className="bg-accent text-accent-content">
                        Accent Button
                    </Button>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Info Color</h2>
                    <Button id="btn-info" className="bg-info text-info-content">
                        Info Button
                    </Button>
                </section>

                <section>
                    <h2 className="text-xl font-semibold mb-3">Success Color</h2>
                    <Button id="btn-success" className="bg-success text-success-content">
                        Success Button
                    </Button>
                </section>
            </div>
        </div>
    );
};

const rootElement = document.getElementById("root");
if (rootElement) {
    const root = ReactDOM.createRoot(rootElement);
    root.render(<App />);
} else {
    console.error("Root element not found");
}