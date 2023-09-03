from django.shortcuts import render
from django.http import HttpResponse
from django.http import JsonResponse
import os
import openai
import json
import replicate
import random
import string
from io import BytesIO
import requests

import base64
import json
from PIL import Image, PngImagePlugin

# Create your views here.
openai.api_key = "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"


def UI_mindmap(request):
    # render(request, "UI_mindmap.html")

    if request.method == 'POST':
        designID = request.POST['designID']

        # 输入design problem 输出Requirements
        if designID == '5W1H':
            prompt = request.POST['message']
            print(prompt)
            response = get_completion(generate_requirements_prompt(prompt))
            # print(response)
            # print(type(response)) # <class 'dict'>
            return JsonResponse(response)
            # return render(request, "UI_mindmap.html")

         # 输入Requirements 输出Function
        elif designID == 'Requirements':
            prompt = request.POST['requirements']
            print(prompt)
            response = get_completion(generate_functions_prompt(prompt))
            print(response)
            # print(type(response)) # <class 'dict'>
            return JsonResponse(response)

        # 输入Function 输出Behaviors
        elif designID == 'Functions':
            prompt = request.POST['functions']
            print(prompt)
            response = get_completion(generate_behaviors_prompt(prompt))
            print(response)
            # print(type(response)) # <class 'dict'>
            return JsonResponse(response)

        # 输入Behaviors 输出sructures
        elif designID == 'Behaviors':
            prompt = request.POST['behaviors']
            print(prompt)
            response = get_completion(generate_structures_prompt(prompt))
            print(response)
            # print(type(response)) # <class 'dict'>
            return JsonResponse(response)

        # 输入Kansei 输出外观设计
        elif designID == 'Kansei':
            kanseiN = request.POST['kansei_n']
            kanseiA = request.POST['kansei_a']
            # print(prompt)
            response = get_completion(
                generate_kansei(kanseiN, kanseiA))
            print(response)
            # print(type(response)) # <class 'dict'>
            return JsonResponse(response)

        elif designID == 'Image':
            prompt = request.POST['image']
            imgList = generate_img(prompt)
            return JsonResponse(imgList, safe=False)

    return render(request, "UI_mindmap.html")


def get_completion(prompt, model="gpt-4"):
    messages = [{"role": "user", "content": prompt}]
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=0.7,  # this is the degree of randomness of the model's output
    )
    print(response)
    response = string2json(response.choices[0].message["content"])
    return response


def get_completion_from_messages(messages, model="gpt-4", temperature=0.7):
    response = openai.ChatCompletion.create(
        model=model,
        messages=messages,
        temperature=temperature,  # 控制模型输出的随机程度
    )
#   print(str(response.choices[0].message))
    print(response)
    response = string2json(response.choices[0].message["content"])
    return response


def string2json(data_string):
    # 使用 json.loads 转换字符串为 JSON 格式
    data_json = json.loads(data_string)
    return data_json


def generate_requirements_prompt(design):
    prompt = f"""
        I want you to act as a designer and work with me on a product design task. \
        In the design process, you need to complete the structure design of the product according to FBS (Function-Behavior-Structure) strategy and the appearance design based on kansei engineering. \
        I want you to respond only as this designer. Do not write all the conversation at once. Please wait for my questions and give me the answer.  \
         Answer the following six questions according to the design problem:
            1 - Who will use this product? 
            2 - What will the user do with this product? 
            3 - When will this product be used? 
            4 - Why do users use this product? 
            5 - Where will this product be used? 
            6 - How will this product be used? 
        
        Design problem given by triple backticks : 
        ```{design}``` \
       
        Output JSON: <json with who/what/when/why/where/how and Answer>
        Only provide the JSON output and do not include any unnecessary words.

        """
    # print(prompt)
    return prompt


def generate_functions_prompt(design):
    prompt = f"""
        I want you to act as a designer and work with me on a product design task. In the design process, you need to complete the structure design of the product according to FBS (Function-Behavior-Structure) strategy and the appearance design based on kansei engineering. I want you to respond only as this designer. Do not write all the conversation at once. Please wait for my questions and give me the answer.\
        Design problem: a lounge chair intended for domestic use that needs to be appealing and attract the user to sit and relax. \
        Product design requirement given by triple backticks: 
            ```{design}```
        What functions does the product need to have in order to meet these requirements?

        I would like to receive a JSON format output, where each entry has a key as a brief name of the function, and the value is a detailed description of that function. For example: "Brief Name": "Function Description". \
        Only provide the JSON output and do not include any unnecessary words.

        """

    return prompt


def generate_behaviors_prompt(design):
    prompt = f"""
        I want you to act as a designer and work with me on a product design task. In the design process, you need to complete the structure design of the product according to FBS (Function-Behavior-Structure) strategy and the appearance design based on kansei engineering. Please respond only as this designer and wait for my questions to provide answers.
        
        Design problem: a lounge chair intended for domestic use that should be appealing and entice the user to sit and relax. 

        Functions of the product given by triple backticks: 
            ```{design}```

        What behaviors should the product implement to enable the above functions? Use the FBS model to reason about all behaviors, focusing solely on behaviors, not structures.

        I would like to receive a JSON format output. I expect the output in the following JSON format:
        {{
            "Function_Name": {{
                "key(Using Phrase Summary the value)": "value(brief description of behavior)",
                "key(Using Phrase Summary the value)": "value(brief description of behavior)",
                ...
            }},
            Function_Name": {{
                "key(Using Phrase Summary Values)": "value(brief description of behavior)",
                ...
            }},
            ...
        }}
        Provide only the JSON output and omit any extraneous content.
        """
    return prompt


def generate_structures_prompt(design):

    prompt = f"""
        I want you to act as a designer and work with me on a product design task. In the design process, you need to complete the structure design of the product according to FBS (Function-Behavior-Structure) strategy and the appearance design based on kansei engineering. I want you to respond only as this designer. Do not write all the conversation at once. Please wait for my questions and give me the answer.\
        Design problem: a lounge chair intended for domestic use that needs to be appealing and attract the user to sit and relax. \
        
        Behaviors that the product needs to achieve given by triple backticks:
            ```{design}```

        What structures can achieve the above behaviors? Please Use the FBS model to reason the substructures of this product.\
        
        
        I would like to receive a JSON format output. I expect the output in the following JSON format:
        {{
            "Behavior_Name": {{
                "structures_Name": "Corresponding Detailed structures Description",
            }},
            "Behavior_Name": {{
                "structures_Name": "Corresponding Detailed structures Description",
                "structures_Name": "Corresponding Detailed structures Description",
                ...
            }},
            ...
        }}
        Only provide the JSON output and do not include any unnecessary words.

        """

    return prompt


def generate_kansei(nouns, adjectives):

    prompt = f""" 
        Please provide a specific appearance design scheme based on Kansei engineering in terms of shape, color and texture,
        ensuring that the elements of ```{nouns}``` are incorporated and ```{adjectives}``` emotions are conveyed. 

         I would like to receive a JSON format output. I expect the output in the following JSON format:
        {{
            "Shape": {{
                "key(Using Phrase Summary Values)": "value(brief description)",
                ...
            }},
            "Color": {{
               "key(Using Phrase Summary Values)": "value(brief description)",
                "key(Using Phrase Summary Values)": "value(brief description)",
                ...
            }},
            "Texture": {{
                 "key(Using Phrase Summary Values)": "value(brief description)",
                ...
            }}
            
        }}

        Only provide the JSON output and do not include any unnecessary words.


        """

    return prompt


def generate_prompt_test(design):
    animal = 'cat'
    return """Suggest three names for an animal that is a superhero.

        Animal: Cat
        Names: Captain Sharpclaw, Agent Fluffball, The Incredible Feline
        Animal: Dog
        Names: Ruff the Protector, Wonder Canine, Sir Barks-a-Lot
        Animal: {}
        Names:""".format(
        animal.capitalize()
    )


def generate_img(design):
    static_file_path_list = []
    default_client = replicate.Client(
        api_token='r8_7XJFtAPvX80YGQshB7D3BCJtVSCdCVu4ZajqN')

    for i in range(4):
        output = default_client.run(
            "stability-ai/stable-diffusion:27b93a2413e7f36cd83da926f3656280b2931564ff050bf9575f1fdf9bcd7478",
            input={"prompt": design}
        )
        # 生成随机的9位字符串
        random_string = ''.join(random.choices(
            string.ascii_letters + string.digits, k=9))

        file_name = f'goods/static/img/output/{random_string}.png'
        static_file_path = f'img/output/{random_string}.png'
        static_file_path_list.append(static_file_path)
        print(static_file_path_list)

        response = requests.get(output[0])
        img = Image.open(BytesIO(response.content))
        img.save(file_name)

    return static_file_path_list
