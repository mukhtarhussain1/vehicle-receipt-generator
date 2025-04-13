import React, { useState } from "react";
import {
  Form,
  Input,
  Button,
  Typography,
  Row,
  Col,
  Card,
  Divider,
  message,
  Radio,
  Flex,
} from "antd";
import { FilePdfOutlined } from "@ant-design/icons";
import jsPDF from "jspdf";
import "jspdf-autotable";
import moment from "moment";
import "./Form.scss";

const { Title } = Typography;

const CarReceiptForm = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  // Form validation rules
  const cnicRule = {
    pattern: /^\d{5}-\d{7}-\d{1}$/,
    message: "Please enter CNIC in format: 00000-0000000-0",
  };

  const contactRule = {
    pattern: /^(\+92|0092|0)[0-9]{10}$/,
    message: "Please enter a valid Pakistani phone number",
  };

  const numberRule = {
    pattern: /^[0-9]+$/,
    message: "Please enter numbers only",
  };

  const yesNoRule = {
    pattern: /^(Yes|No|YES|NO|yes|no)$/,
    message: "Please enter Yes or No",
  };

  // Convert number to words (for currency)
  const numberToWords = (num) => {
    const single = [
      "",
      "One",
      "Two",
      "Three",
      "Four",
      "Five",
      "Six",
      "Seven",
      "Eight",
      "Nine",
    ];
    const double = [
      "Ten",
      "Eleven",
      "Twelve",
      "Thirteen",
      "Fourteen",
      "Fifteen",
      "Sixteen",
      "Seventeen",
      "Eighteen",
      "Nineteen",
    ];
    const tens = [
      "",
      "",
      "Twenty",
      "Thirty",
      "Forty",
      "Fifty",
      "Sixty",
      "Seventy",
      "Eighty",
      "Ninety",
    ];
    const formatTenth = (digit, prev) => {
      return 0 == digit ? "" : " " + (1 == digit ? double[prev] : tens[digit]);
    };
    const formatOther = (digit, next, denom) => {
      return (
        (0 != digit && 1 != next ? " " + single[digit] : "") +
        (0 != next || digit > 0 ? " " + denom : "")
      );
    };

    let str = "";
    str += num < 0 ? "Negative " : "";
    let fraction = ("" + num).split(".");

    let n = Math.abs(Number(fraction[0]));
    let crore = Math.floor(n / 10000000) % 100;
    if (crore > 0) {
      str += (str != "" ? " " : "") + numberToWords(crore) + " Crore";
    }

    let lakh = Math.floor(n / 100000) % 100;
    if (lakh > 0) {
      str += (str != "" ? " " : "") + numberToWords(lakh) + " Lakh";
    }

    let thousand = Math.floor(n / 1000) % 100;
    if (thousand > 0) {
      str += (str != "" ? " " : "") + numberToWords(thousand) + " Thousand";
    }

    let hundred = Math.floor(n / 100) % 10;
    if (hundred > 0) {
      str += (str != "" ? " " : "") + numberToWords(hundred) + " Hundred";
    }

    let ten = Math.floor(n / 10) % 10;
    let unit = Math.floor(n) % 10;

    if (ten > 0 || unit > 0) {
      if (str !== "") str += " and";
      str += formatTenth(ten, unit);
      str += 1 != ten ? formatOther(unit, 0, "") : "";
    }

    if (str === "") str = "Zero";

    return str;
  };

  // Generate PDF with form data
  const generatePDF = (values) => {
    setLoading(true);

    try {
      // Create new PDF document
      const doc = new jsPDF();

      // Set font
      doc.setFont("helvetica", "bold");
      doc.setFontSize(22);

      // Add title
      doc.text("Sale Receipt", 105, 20, { align: "center" });

      // Reset font for content
      doc.setFont("helvetica", "normal");
      doc.setFontSize(12);

      // Format date and time

      const date = moment().format("DD-MM-YYYY");
      const time = moment().format("h:mm A");

      // Calculate amount in words
      const amountInWords = numberToWords(values.advancePayment || 0);

      // Add content
      // Updated position constants
      const leftX = 20;
      const midX = 105;
      const rightX = 150;
      const lineGap = 10;

      let y = 35;

      doc.text(
        `Received with thanks the sum of Rs: ${values.advancePayment || ""}/-`,
        leftX,
        y
      );
      y += lineGap;
      doc.text(`Rupees (in Words) Rs: ${amountInWords} Only`, leftX, y);
      y += lineGap;
      doc.text(
        `From (Purchaser) Mr/Ms. ${values.buyerName || ""} S/o ${
          values.buyerFather || ""
        }`,
        leftX,
        y
      );
      y += lineGap;
      doc.text(`Resident of ${values.buyerAddress || ""}`, leftX, y);
      y += lineGap;
      doc.text(
        `Against the sale of Motor Car ${values.carMaker || ""} ${
          values.modelNumber || ""
        }`,
        leftX,
        y
      );
      y += lineGap;

      // First row of car details
      doc.text(`Registration # ${values.registrationNo || ""}`, leftX, y);
      doc.text(`Maker: ${values.carMaker || ""}`, midX, y);
      y += lineGap;
      doc.text(`Model: ${values.modelNumber || ""}`, leftX, y);
      doc.text(`Horse Power: ${values.horsePower || ""}`, midX, y);
      y += lineGap;

      // Second row
      doc.text(`Chasis # ${values.chassisNo || ""}`, leftX, y);
      doc.text(`Engine # ${values.engineNo || ""}`, midX, y);
      y += lineGap;

      // Third row of document details
      doc.text(
        `Original File: ${values.originalFile === "Yes" ? "Yes" : "No"}`,
        leftX,
        y
      );
      doc.text(
        `Computerized No. Plate: ${
          values.computerizedNoPlate === "Yes" ? "Yes" : "No"
        }`,
        midX,
        y
      );
      y += lineGap;
      doc.text(`Pages: ${values.totalFilePages || "No"}`, leftX, y);
      y += lineGap;

      // Payment details
      doc.text(
        `As payment/After Final Settlement by Cash Today ${date} At Time ${time}`,
        leftX,
        y
      );
      y += lineGap;
      //   doc.text(`At Time ${time}`, leftX, y);
      //   y += lineGap * 2;

      // Seller info
      doc.setFont("helvetica", "bold");
      doc.text(`Seller's ID Card & Mobil #`, leftX, y);
      doc.setFont("helvetica", "normal");
      y += lineGap;
      doc.text(`${values.sellerCNIC || ""}`, leftX, y);
      y += lineGap;
      doc.text(`${values.sellerContact || ""}`, leftX, y);
      y += lineGap;
      doc.text(`Seller Name: ${values.sellerName || ""}`, leftX, y);
      y += lineGap;

      // Buyer info
      doc.setFont("helvetica", "bold");
      doc.text(`Purchaser ID Card Num`, rightX, y - lineGap * 4); // Re-adjust to align
      doc.setFont("helvetica", "normal");
      doc.text(`${values.buyerCNIC || ""}`, rightX, y - lineGap * 3);
      doc.text(`${values.buyerContact || ""}`, rightX, y - lineGap * 2);

      // Signature
      // doc.text("Signature: _________________", rightX, y);
      // y += lineGap * 2;

      // Disclaimer
      doc.setFont("helvetica", "italic");
      doc.text(
        `The vehicle ownership is transferred at ${date}. Any legal issues`,
        leftX,
        y
      );
      y += lineGap;
      doc.text(
        "regarding this vehicle are now the buyer's responsibility.",
        leftX,
        y
      );
      y += lineGap;

      // Note
      doc.setFont("helvetica", "bold");
      doc.text("Note:", leftX, y);
      doc.setFont("helvetica", "normal");
      doc.text(
        "This receipt is non-refundable. Transfer process must be completed within 7 days.",
        leftX + 15,
        y
      );

      // Save PDF
      doc.save("car-sale-receipt.pdf");

      message.success("PDF generated successfully!");
    } catch (error) {
      console.error("PDF generation error:", error);
      message.error("Failed to generate PDF. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const onFinish = (values) => {
    console.log("Success:", values);
    generatePDF(values);
    // reset form
    form.resetFields();
  };

  const onFinishFailed = (errorInfo) => {
    console.log("Failed:", errorInfo);
    message.error("Please fix the errors in the form");
  };

  return (
    <div className="car-receipt-container">
      <Card className="form-card">
        <Title level={2} className="form-title">
          Generate Car Receipt
        </Title>

        <Form
          form={form}
          name="carReceiptForm"
          layout="vertical"
          onFinish={onFinish}
          onFinishFailed={onFinishFailed}
          autoComplete="off"
          requiredMark={false}
        >
          <Row gutter={24}>
            {/* Seller Information Section */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Seller Information</Divider>

              <Form.Item
                label="Seller Name"
                name="sellerName"
                rules={[
                  { required: true, message: "Please enter seller name" },
                ]}
              >
                <Input placeholder="Enter seller's name" />
              </Form.Item>

              <Form.Item
                label="Father Name"
                name="fatherName"
                rules={[
                  { required: true, message: "Please enter father name" },
                ]}
              >
                <Input placeholder="Enter seller's father name" />
              </Form.Item>

              <Form.Item
                label="Seller Contact"
                name="sellerContact"
                rules={[
                  { required: true, message: "Please enter seller contact" },
                  contactRule,
                ]}
              >
                <Input placeholder="Enter seller's contact" />
              </Form.Item>

              <Form.Item
                label="CNIC"
                name="sellerCNIC"
                rules={[
                  { required: true, message: "Please enter seller CNIC" },
                  cnicRule,
                ]}
              >
                <Input placeholder="Enter seller's CNIC" />
              </Form.Item>

              <Form.Item
                label="Permanent Address"
                name="permanentAddress"
                rules={[
                  { required: true, message: "Please enter permanent address" },
                ]}
              >
                <Input placeholder="Enter seller's permanent address" />
              </Form.Item>
            </Col>

            {/* Vehicle Information Section */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Vehicle Information</Divider>

              <Form.Item
                label="Registration No."
                name="registrationNo"
                rules={[
                  {
                    required: true,
                    message: "Please enter registration number",
                  },
                ]}
              >
                <Input placeholder="Enter car registration number" />
              </Form.Item>

              <Form.Item
                label="Engine No."
                name="engineNo"
                rules={[
                  { required: true, message: "Please enter engine number" },
                ]}
              >
                <Input placeholder="Enter engine number" />
              </Form.Item>

              <Form.Item
                label="Horse Power"
                name="horsePower"
                rules={[
                  { required: true, message: "Please enter horse power" },
                  numberRule,
                ]}
              >
                <Input placeholder="Enter horse power" />
              </Form.Item>

              <Form.Item
                label="Chassis No."
                name="chassisNo"
                rules={[
                  { required: true, message: "Please enter chassis number" },
                ]}
              >
                <Input placeholder="Enter chassis number" />
              </Form.Item>

              <Form.Item
                label="Maker"
                name="carMaker"
                rules={[{ required: true, message: "Please enter car maker" }]}
              >
                <Input placeholder="Enter car maker e.g. Honda, Toyota" />
              </Form.Item>

              <Form.Item
                label="Model Number"
                name="modelNumber"
                rules={[
                  { required: true, message: "Please enter model number" },
                ]}
              >
                <Input placeholder="Enter car model number" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={24}>
            {/* Registration Details */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Registration Details</Divider>

              <Form.Item
                label="Original Registration No."
                name="originalRegistrationNo"
                rules={[
                  {
                    required: true,
                    message: "Please enter original registration number",
                  },
                ]}
              >
                <Input placeholder="Enter original registration number" />
              </Form.Item>

              <Form.Item
                label="Original File"
                name="originalFile"
                rules={[
                  {
                    required: true,
                    message: "Please specify if original file is present",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Total File Pages"
                name="totalFilePages"
                rules={[
                  { required: true, message: "Please enter total file pages" },
                  numberRule,
                ]}
              >
                <Input placeholder="Enter total file pages" />
              </Form.Item>

              <Form.Item
                label="Computerized No. Plate"
                name="computerizedNoPlate"
                rules={[
                  {
                    required: true,
                    message: "Please specify if computerized plate is present",
                  },
                ]}
              >
                <Radio.Group>
                  <Radio value="Yes">Yes</Radio>
                  <Radio value="No">No</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Color"
                name="color"
                rules={[
                  { required: true, message: "Please enter vehicle color" },
                ]}
              >
                <Input placeholder="Enter color" />
              </Form.Item>
            </Col>

            {/* Buyer Information Section */}
            <Col xs={24} md={12}>
              <Divider orientation="left">Buyer Information</Divider>

              <Form.Item
                label="Buyer Name"
                name="buyerName"
                rules={[{ required: true, message: "Please enter buyer name" }]}
              >
                <Input placeholder="Enter buyer's name" />
              </Form.Item>

              <Form.Item
                label="Buyer Father Name"
                name="buyerFather"
                rules={[
                  { required: true, message: "Please enter buyer father name" },
                ]}
              >
                <Input placeholder="Enter buyer's father name" />
              </Form.Item>

              <Form.Item
                label="Buyer Contact"
                name="buyerContact"
                rules={[
                  { required: true, message: "Please enter buyer contact" },
                  contactRule,
                ]}
              >
                <Input placeholder="Enter buyer's contact" />
              </Form.Item>

              <Form.Item
                label="Buyer CNIC"
                name="buyerCNIC"
                rules={[
                  { required: true, message: "Please enter buyer CNIC" },
                  cnicRule,
                ]}
              >
                <Input placeholder="Enter buyer's CNIC" />
              </Form.Item>

              <Form.Item
                label="Buyer Address"
                name="buyerAddress"
                rules={[
                  { required: true, message: "Please enter buyer address" },
                ]}
              >
                <Input placeholder="Enter buyer's address" />
              </Form.Item>

              <Form.Item
                label="Advance Payment"
                name="advancePayment"
                rules={[
                  { required: true, message: "Please enter advance payment" },
                  numberRule,
                ]}
              >
                <Input placeholder="Enter advance payment" />
              </Form.Item>
            </Col>
          </Row>

          <Flex justify="center">
            <Form.Item className="form-submit">
              <Button
                type="primary"
                htmlType="submit"
                icon={<FilePdfOutlined />}
                size="large"
                block
                loading={loading}
              >
                Save PDF
              </Button>
            </Form.Item>
          </Flex>
        </Form>
      </Card>
    </div>
  );
};

export default CarReceiptForm;
