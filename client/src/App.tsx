import React, { useState, useEffect } from 'react'
import axios from 'axios';
import './App.css'

function App() {
  const [inputVar, setVar] = useState('')

  // const [getAIres, setAIres] = useState('')

  const handleOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setVar(event.target.value)
  }

  async function handleBttnClick(){
    append_user_question(inputVar)
    const model_res = await makeRequest(inputVar)
    append_ai_responce(model_res)
    setVar('')
  };

  async function cycle_entry_text() {
    const entry_text_container: HTMLElement | null = document.getElementById("h1_entry");
    const text_options = ['Welcome to your precise Bot!', 'AI improved...', 'Precision 🎯 is Key.'];

  
    if (!entry_text_container) {
      console.error("Element with id 'h1_entry' not found.");
      return;
    }
  
    const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
      for (const str of text_options) {
        entry_text_container.textContent = ''; // Clear the text content before each iteration
        for (let i = 0; i <= str.length; i++) {
          entry_text_container.textContent = str.substring(0, i); // Set text content progressively
          await delay(100); // Adjust the delay as needed
        }
        await delay(2000); // Adjust the delay between messages as needed
      }
  }

  async function append_user_question(inputVar: string){
    const newDiv = document.createElement('div');
    newDiv.innerHTML = `\
    <div id = "user_chat_bubble">\
    <p id = "output_text"><b>You:</b> ${inputVar} </p>\
    </div>`;

    const container: HTMLElement | null = document.getElementById("output_card");
    if(container){
      container.appendChild(newDiv)
    }  
  };

  async function append_ai_responce(model_res: string){
    const newDiv = document.createElement('div');
    newDiv.innerHTML = `<div id="ai_chat_bubble">
                         <p id="output_text"><b>Bot:</b> ${model_res}</p></div>`;

    const container: HTMLElement = document.getElementById("output_card") as HTMLElement;
    container.appendChild(newDiv)
    check_if_scroll()  
  };

  async function check_if_scroll(){
    const divElement = document.getElementById("output_card") as HTMLElement;
    const scrollRemDiv = document.getElementById("scroll_reminder") as HTMLElement;
    if (divElement.scrollHeight > divElement.clientHeight || divElement.scrollWidth > divElement.clientWidth) {
        console.log("Overflow is activated in the div element.");
        scrollRemDiv.innerHTML = "<small>- Scroll Down -</small>"
    } else {
        console.log("Overflow is not activated in the div element.");
    }
  };
  async function makeRequest(query: string): Promise<string>{
    let model_responce: string = '';
    try {
        const response = await axios.get(`http://localhost:5000/AIresponse/${query}`, { withCredentials: true });
        // const response = await axios.get(`http://192.168.0.252:5000/AIresponse/${query}`);
        model_responce = response.data.choices[0].message.content.toString();
        // await setAIres(model_responce);
        console.log("From the req func", model_responce);
    } catch (error) {
        console.error('Error making request:', error);
    }finally{
      return model_responce
    }
  };

  
  async function set_session(){
    try{
        const response = await axios.get(`http://localhost:5000/SetSession/`, { withCredentials: true });
        // const response = await axios.get('http://192.168.0.252:5000/SetSession/');
        console.log("Success",response);
    }
    catch(err){
      console.log("Error in creating the session:" , err);
    }
  };
  const setSession = () => {
    axios.get('http://localhost:5000/setSessionTEST', { withCredentials: true })
      .then(response => console.log(response.data))
      .catch(error => console.error('Error:', error));
  };

  const getSession = () => {
    axios.get('http://localhost:5000/getSessionTEST', { withCredentials: true })
      .then(response => console.log(response.data))
      .catch(error => console.error('Error:', error));
  };

  // async function Test_Session(){
    
  //   const set_session = await axios.get('http://localhost:5000/setSessionTEST');
  //   const get_session = await axios.get('http://localhost:5000/getSessionTEST');
  //   console.log(set_session);
  //   console.log(get_session)
  // };


  useEffect(() => {
    setSession();
    getSession();
    // Test_Session();
    set_session();
    cycle_entry_text();
  }, []);
  return (
    <>
      <div id = 'main_content'>
        <div>
            <div id = 'entry_text'>
              <h1 id='h1_entry'>Welcome to your precise <br />Bot!</h1>
            </div>
            <div id = 'input_box'>
              <input placeholder = "Enter your question..."id = 'user_input' type="text" value={inputVar} onChange={handleOnChange} />
              <button value={inputVar} onClick={handleBttnClick}>Submit</button>        
            </div>
        </div>
          <div id = "output_card"></div>
          <div id = "scroll_reminder"></div>
      </div>
    </>
  )
}

export default App
