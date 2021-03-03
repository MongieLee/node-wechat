const express = require("express");
const app = new express();
const port = 5000;
const request = require("request");

app.all("*", function (_, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "X-Requested-With");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  next();
});

let acc;
app.get("/getWechatUser", (req, ress) => {
  const { appid, secret, code } = req.query;
  request.get(
    {
      url: `https://api.weixin.qq.com/sns/oauth2/access_token?appid=${appid}&secret=${secret}&code=${code}&grant_type=authorization_code`,
    },
    (err, res, body) => {
      if (err) {
        throw new Error(err);
      }
      if (res.statusCode === 200) {
        const { access_token, openid } = JSON.parse(body);
        acc = access_token;
        console.log("access_token:");
        console.log(access_token);
        request.get(
          {
            url: `https://api.weixin.qq.com/sns/userinfo?access_token=${access_token}&openid=${openid}&lang=zh_CN`,
          },
          function (error, response, body) {
            if (error) {
              throw new Error(err);
            }
            if (response.statusCode == 200) {
              ress.send(body);
              request.get(
                {
                  url: `https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=${appid}&secret=${secret}`,
                },
                function (err, res, body) {
                  console.log(body);
                  const fuck = JSON.parse(body).access_token;
                  request.post(
                    `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${fuck}`,
                    {
                      json: requestData,
                    },
                    function (error, response, body) {
                      console.log(body);
                      if (!error && response.statusCode == 200) {
                        console.log("模板消息推送成功");
                      }
                    }
                  );
                }
              );
            }
          }
        );
        console.log(
          `https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=${access_token}`
        );

        var requestData = {
          touser: openid,
          template_id: "Rf8OS1jya1gAeKJqB494Uzx6zKxmT7YGJJ_qH8f2HUM",
          url: "http://192.168.8.66:8080",
          data: {
            plan: {
              value: "已通过",
              color: "#173177",
            },
            handelUser: {
              value: "张三",
              color: "#1d1d1d",
            },
            time: {
              value: "2020-1-1",
              color: "#1d1d1d",
            },
          },
        };
      }
    }
  );
});

app.listen(port, () => {
  console.log("server run in http://localhost:" + port);
});
