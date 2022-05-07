module.exports = {
  apps: [
    {
      name: "app1",
      script: "node listen 0xb3ad74fe581e94e491b1ed8bfccb87e53e608870",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app2",
      script: "node listen 0x0b01f1310e7224dafed24c3b62d53cec37d9faf8 ",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app3",
      script: "node listen 0x809e82136239a5f26596bd6ce9192207bdffa04c",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app4",
      script: "node listen 0x405ce2d22faff3a0420568c84cc660548070ce52",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app5",
      script: "node listen 0x0b01f1310e7224dafed24c3b62d53cec37d9faf8",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app6",
      script: "node listen 0xf9f0357268b76661fdaa433c96fffe4311daa15f",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    {
      name: "app7",
      script: "node listen 0xddd3227cc48d04e5ea17e8b9def870c45160501e",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },{
      name: "app8",
      script: "node listen 0x0B01F1310e7224DAfEd24C3B62d53CeC37d9fAf8",
      error_file: "logs/err.log",
      out_file: "logs/out.log",
    },
    // {
    //   name: "test",
    //   script:
    //     "node test/listen_rinkeby 0xF1291E8B0a81f4E32C7D93bb91793b754524dBe2 --alarm",
    //   error_file: "logs/err.log",
    // },
    // {
    //   name: 'test',
    //   script: 'node test/try_alarm'
    // },
    // {
    //   name: 'test1',
    //   script: 'node test/test_email'
    // }
  ],
}
