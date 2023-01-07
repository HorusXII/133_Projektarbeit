from flask import Flask, render_template, url_for

app = Flask(__name__)
app.debug = True

@app.route('/')
def index():
    # Generate the URL for the JavaScript file
    js_url = url_for('static', filename='JavaScriptProjektarbeit.js')

    # Render the index.html template, passing the JavaScript URL as a variable
    return render_template('index.html', js_url=js_url)
    
# Run the app if it is the main module
if __name__ == '__main__':
    # Start the app, binding it to all available network interfaces
    app.run(host='0.0.0.0')