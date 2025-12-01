console.log("Debug script loading...");

const root = document.getElementById("root");
if (!root) {
  console.error("Root element not found!");
  document.body.innerHTML =
    '<h1 style="color:red;">Root element not found!</h1>';
} else {
  console.log("Root element found, updating content...");
  root.innerHTML = `
    <div style="padding: 40px; font-family: Arial, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; min-height: 100vh;">
      <h1 style="font-size: 48px; margin-bottom: 20px;">✅ Debug Mode Active</h1>
      <p style="font-size: 24px; margin-bottom: 10px;">JavaScript is executing correctly!</p>
      <p style="font-size: 18px; opacity: 0.9;">Time: ${new Date().toLocaleTimeString()}</p>
      <p style="font-size: 18px; opacity: 0.9;">Server: Running on port 5000</p>
    </div>
  `;
  console.log("Content updated successfully!");
}
