#!/usr/bin/env python3
# -*- coding: utf-8 -*-
import json
import os

BOOK_ID = "KiLuatTichCucTrongThucHanhLamChaMeHangNgay"
OUTPUT_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "book", BOOK_ID, "quizzes")
os.makedirs(OUTPUT_DIR, exist_ok=True)

QUIZZES = {
    "00_loi_noi_dau": {
        "chapterTitle": "Lời nói đầu & Mục lục",
        "questions": [
            {
                "id": "q1",
                "question": "Báo cáo về bạo lực đối với trẻ em trên thế giới năm 2006 của Liên Hợp Quốc chỉ ra nguyên nhân chính của tình trạng bạo lực đối với trẻ em là gì?",
                "options": [
                    "Do trẻ em ngày nay ngày càng ngỗ ngược và khó bảo hơn trước.",
                    "Do thói quen văn hóa lạc hậu và sự thiếu hiểu biết về quyền con người của trẻ em.",
                    "Do sự thiếu hụt các điều luật nghiêm ngặt tại các trường học công lập.",
                    "Do áp lực kinh tế và đời sống khó khăn của các gia đình nghèo."
                ],
                "correctIndex": 1,
                "explanation": "Báo cáo của LHQ năm 2006 chỉ rõ nạn bạo lực với trẻ em bắt nguồn từ những tập quán văn hóa lạc hậu (như quan niệm 'thương cho roi cho vọt') và sự thiếu nhận thức rằng trẻ em cũng là những con người có đầy đủ phẩm giá và quyền được tôn trọng."
            },
            {
                "id": "q2",
                "question": "Công ước về Quyền Trẻ em (UNCRC) được các nhà lãnh đạo thế giới phê chuẩn vào năm nào?",
                "options": [
                    "Năm 1975",
                    "Năm 1989",
                    "Năm 2000",
                    "Năm 2006"
                ],
                "correctIndex": 1,
                "explanation": "Năm 1989, các nhà lãnh đạo trên toàn thế giới đã đồng thuận thông qua Công ước Liên Hợp Quốc về Quyền Trẻ em, khẳng định trẻ em có đầy đủ các quyền công dân và quyền con người."
            },
            {
                "id": "q3",
                "question": "Theo Công ước Quyền Trẻ em, mối quan hệ giữa cha mẹ và con cái được định vị như thế nào?",
                "options": [
                    "Cha mẹ là chủ sở hữu hợp pháp của con cái và có toàn quyền định đoạt tương lai của con.",
                    "Con cái là tài sản của gia đình, có nghĩa vụ tuyệt đối tuân lệnh cha mẹ.",
                    "Cha mẹ có vai trò chính nuôi dạy, là người dẫn dắt và hình mẫu, nhưng con cái không phải là tài sản của cha mẹ.",
                    "Nhà nước là chủ thể duy nhất nuôi dạy trẻ, cha mẹ chỉ đóng vai trò hỗ trợ tài chính."
                ],
                "correctIndex": 2,
                "explanation": "Công ước chỉ rõ cha mẹ giữ vai trò người thầy, người bảo hộ và hình mẫu quan trọng nhất của con; tuy nhiên các nguyên tắc nhân quyền bảo đảm rằng không một con người nào có thể là tài sản hay vật sở hữu của người khác."
            },
            {
                "id": "q4",
                "question": "Nhóm quyền nào sau đây thuộc về 'Quyền được sống và phát triển đầy đủ tiềm năng' của trẻ em?",
                "options": [
                    "Quyền được vui chơi giải trí, chăm sóc sức khỏe, dinh dưỡng và tiếp cận giáo dục đầy đủ.",
                    "Quyền được tự do lao động kiếm tiền từ khi còn nhỏ để giúp đỡ gia đình.",
                    "Quyền miễn trừ hoàn toàn khỏi mọi kỷ luật và sự hướng dẫn của người lớn.",
                    "Quyền yêu cầu cha mẹ phải đáp ứng mọi đòi hỏi vật chất vô điều kiện."
                ],
                "correctIndex": 0,
                "explanation": "Quyền sống và phát triển bao gồm quyền có đủ thực phẩm, chỗ ở phù hợp, nước sạch, được chăm sóc y tế, tiếp cận giáo dục chất lượng và được vui chơi giải trí lành mạnh."
            },
            {
                "id": "q5",
                "question": "Nội dung nào sau đây thể hiện đúng 'Quyền tham gia' của trẻ em theo Công ước UNCRC?",
                "options": [
                    "Trẻ em có quyền tự ý bỏ học mà không cần sự đồng ý của cha mẹ.",
                    "Trẻ em được bày tỏ quan điểm và quan điểm đó cần được người lớn lắng nghe, tôn trọng.",
                    "Trẻ em có quyền đưa ra mọi quyết định tài chính quan trọng trong gia đình.",
                    "Trẻ em chỉ được phép tham gia ý kiến khi đã bước sang tuổi 18."
                ],
                "correctIndex": 1,
                "explanation": "Quyền tham gia khẳng định trẻ em có quyền bày tỏ suy nghĩ, cảm xúc và quan điểm của mình về những vấn đề ảnh hưởng đến đời sống của trẻ, và người lớn cần lắng nghe và tôn trọng tiếng nói đó."
            },
            {
                "id": "q6",
                "question": "Bản chất cốt lõi của phương pháp 'Kỷ luật tích cực' dựa trên tinh thần nào?",
                "options": [
                    "Buộc trẻ phải vâng lời tuyệt đối thông qua hình thức đe dọa và trừng phạt nghiêm khắc.",
                    "Dựa trên các quyền của trẻ em nhằm giúp trẻ phát triển lành mạnh, được bảo vệ khỏi bạo lực và chủ động học tập.",
                    "Để trẻ hoàn toàn tự do muốn làm gì thì làm, không cần bất kỳ giới hạn hay quy tắc nào.",
                    "Tập trung thưởng quà vật chất mỗi khi trẻ làm đúng và cắt viện trợ khi trẻ làm sai."
                ],
                "correctIndex": 1,
                "explanation": "Kỷ luật tích cực được xây dựng trên nền tảng nhân quyền của trẻ: quyền được phát triển lành mạnh, quyền được bảo vệ khỏi mọi hình thức bạo lực và quyền được tham gia quá trình học tập tích cực."
            },
            {
                "id": "q7",
                "question": "Tổ chức quốc tế nào đã chủ trì và phối hợp biên soạn, phát hành bộ tài liệu Kỷ luật tích cực này?",
                "options": [
                    "Tổ chức Y tế Thế giới (WHO)",
                    "Quỹ Tiền tệ Quốc tế (IMF)",
                    "Tổ chức Cứu trợ Trẻ em (Save the Children)",
                    "Ngân hàng Thế giới (World Bank)"
                ],
                "correctIndex": 2,
                "explanation": "Tổ chức Cứu trợ Trẻ em (Save the Children) là đơn vị khởi xướng, tài trợ nghiên cứu và triển khai chương trình Kỷ luật tích cực trên toàn thế giới nhằm chấm dứt bạo lực đối với trẻ em."
            },
            {
                "id": "q8",
                "question": "Công ước về Quyền Trẻ em yêu cầu các quốc gia thành viên phải bảo vệ trẻ em khỏi những điều gì?",
                "options": [
                    "Mọi hình thức bạo lực thể xác, lạm dụng tinh thần, bóc lột sức lao động và đối xử tàn nhẫn.",
                    "Những khó khăn thử thách trong việc học tập kiến thức ở trường lớp.",
                    "Sự giám sát và hướng dẫn đạo đức cần thiết của cha mẹ trong gia đình.",
                    "Tất cả các hoạt động thể chất có tính chất vận động ngoài trời."
                ],
                "correctIndex": 0,
                "explanation": "Công ước quy định các quốc gia phải bảo vệ trẻ em khỏi mọi hình thức bạo lực thể chất và tinh thần, thương tổn, bỏ mặc hoặc bóc lột, bao gồm cả các hình phạt thể xác trong gia đình và trường học."
            },
            {
                "id": "q9",
                "question": "Tại sao nhiều bậc cha mẹ trước đây thường có xu hướng sử dụng đòn roi hoặc quát mắng để kỷ luật con?",
                "options": [
                    "Vì đó là phương pháp khoa học duy nhất đã được chứng minh hiệu quả qua các nghiên cứu hiện đại.",
                    "Vì họ học làm cha mẹ chủ yếu từ bản năng, cảm xúc bộc phát hoặc lặp lại trải nghiệm thời thơ ấu của chính mình.",
                    "Vì trẻ em sinh ra vốn không thể hiểu được bất kỳ lời giải thích lý lẽ nào.",
                    "Vì pháp luật trước đây bắt buộc cha mẹ phải trừng phạt thể xác con cái."
                ],
                "correctIndex": 1,
                "explanation": "Đa số phụ huynh chưa được đào tạo về phát triển trẻ em, nên họ hành động dựa trên cảm xúc bốc đồng hoặc sao chép lại cách thức mà thế hệ trước từng đối xử với họ."
            },
            {
                "id": "q10",
                "question": "Mục tiêu trọng tâm của tài liệu Kỷ luật tích cực trong thực hành làm cha mẹ hàng ngày là gì?",
                "options": [
                    "Cung cấp các chế tài xử phạt hành chính đối với những phụ huynh vi phạm quyền trẻ em.",
                    "Trang bị cho cha mẹ cách dạy con hiệu quả, đồng hành cùng con mà vẫn tôn trọng phẩm giá và quyền con người của trẻ.",
                    "Hướng dẫn con cái cách phản kháng và kiện tụng cha mẹ mỗi khi có bất đồng ý kiến.",
                    "Đưa ra các kỹ thuật tâm lý giúp cha mẹ kiểm soát hoàn toàn mọi hành vi của con 24/7."
                ],
                "correctIndex": 1,
                "explanation": "Cuốn sách trao cho cha mẹ công cụ, kiến thức phát triển và phương pháp phản ứng thực tế để nuôi dạy con nên người trong sự gắn kết yêu thương mà không cần dùng đến bạo lực."
            }
        ]
    },
    "00_loi_gioi_thieu": {
        "chapterTitle": "Lời giới thiệu",
        "questions": [
            {
                "id": "q1",
                "question": "Theo tác giả Joan E. Durrant, ý nghĩa thực sự của từ 'Kỷ luật' (Discipline) bắt nguồn từ đâu?",
                "options": [
                    "Có nghĩa là trừng phạt và răn đe để người khác biết sợ hãi.",
                    "Có nghĩa là giảng dạy, hướng dẫn dựa trên mục tiêu học tập rõ ràng.",
                    "Có nghĩa là áp đặt trật tự và kỷ cương một cách nghiêm khắc.",
                    "Có nghĩa là bỏ mặc để mọi chuyện tự do diễn ra tự nhiên."
                ],
                "correctIndex": 1,
                "explanation": "Từ 'kỷ luật' có gốc từ tiếng Latinh là 'disciplina', có nghĩa là giảng dạy hoặc học tập. Kỷ luật thực sự là một quá trình giáo dục dài hạn, chứ không phải là sự trừng phạt tức thời."
            },
            {
                "id": "q2",
                "question": "Điều nào sau đây KHÔNG PHẢI là đặc điểm của Kỷ luật tích cực?",
                "options": [
                    "Là sự buông thả vô điều kiện, để trẻ muốn làm gì thì làm mà không có giới hạn.",
                    "Là giải pháp dài hạn phát triển khả năng tự kiểm soát của trẻ.",
                    "Là sự giao tiếp tôn trọng và xây dựng mối quan hệ tin cậy giữa cha mẹ và con cái.",
                    "Là việc giảng dạy cho trẻ các kỹ năng sống và cách cư xử đúng đắn."
                ],
                "correctIndex": 0,
                "explanation": "Kỷ luật tích cực không hề đồng nghĩa với sự dễ dãi hay buông thả. Ngược lại, nó cung cấp cho trẻ những giới hạn và cấu trúc rất rõ ràng trong bầu không khí ấm áp, yêu thương."
            },
            {
                "id": "q3",
                "question": "Bộ khung Kỷ luật tích cực được xây dựng dựa trên bao nhiêu khối nền tảng cốt lõi?",
                "options": [
                    "2 khối",
                    "3 khối",
                    "4 khối",
                    "6 khối"
                ],
                "correctIndex": 2,
                "explanation": "Bộ khung gồm 4 khối xây dựng: (1) Xác định mục tiêu lâu dài, (2) Tạo sự ấm áp và cấu trúc, (3) Hiểu cách trẻ nghĩ và cảm nhận, và (4) Giải quyết vấn đề."
            },
            {
                "id": "q4",
                "question": "Khối xây dựng đầu tiên - 'Xác định mục tiêu lâu dài' - giúp ích gì cho các bậc cha mẹ?",
                "options": [
                    "Giúp cha mẹ tiết kiệm tối đa chi phí tài chính cho việc học đại học của con sau này.",
                    "Giúp cha mẹ vượt qua các xung đột tức thời trước mắt để hướng tới những giá trị con cần có khi trưởng thành.",
                    "Giúp cha mẹ lập trình chi tiết thời gian biểu học tập từng ngày của con trong suốt 12 năm học.",
                    "Giúp con sớm kiếm được việc làm lương cao ngay khi tốt nghiệp phổ thông."
                ],
                "correctIndex": 1,
                "explanation": "Xác định mục tiêu dài hạn giúp phụ huynh không bị cuốn vào phản ứng nóng giận tức thì trước những lỗi lầm vặt vãnh, mà tận dụng tình huống đó để dạy con những đức tính tốt đẹp ở tuổi 20."
            },
            {
                "id": "q5",
                "question": "Trong khối xây dựng thứ hai, 'Sự ấm áp' (Warmth) đem lại điều gì quan trọng nhất cho trẻ?",
                "options": [
                    "Cung cấp thật nhiều quần áo ấm và đồ ăn ngon mỗi ngày.",
                    "Cảm giác an toàn về mặt cảm xúc, sự tin cậy và niềm tin rằng mình luôn được yêu thương vô điều kiện.",
                    "Đồng ý với tất cả những đòi hỏi mua sắm đồ chơi của trẻ.",
                    "Bảo vệ trẻ tuyệt đối để trẻ không bao giờ gặp bất cứ khó khăn hay thất bại nào trong đời."
                ],
                "correctIndex": 1,
                "explanation": "Sự ấm áp mang lại sự an toàn về tình cảm, giúp trẻ cảm thấy gắn kết, tin cậy cha mẹ, từ đó mở lòng lắng nghe và học hỏi những bài học đạo đức từ người lớn."
            },
            {
                "id": "q6",
                "question": "Vai trò chính của 'Cấu trúc' (Structure) trong Kỷ luật tích cực là gì?",
                "options": [
                    "Thiết lập một thời gian biểu quân đội gắt gao không được sai lệch một phút nào.",
                    "Đưa ra các hình phạt hà khắc để trẻ không bao giờ dám vi phạm nội quy.",
                    "Cung cấp hướng dẫn rõ ràng, giải thích lý do, đưa ra ranh giới và chỉ cho trẻ cách khắc phục sai lầm.",
                    "Xây dựng phòng học riêng biệt cách ly trẻ với thế giới bên ngoài."
                ],
                "correctIndex": 2,
                "explanation": "Cấu trúc đóng vai trò như bản đồ chỉ đường: chỉ cho trẻ biết kỳ vọng của cha mẹ, lý do đằng sau các quy tắc, thông tin cần thiết và cách sửa chữa lỗi sai khi làm hỏng việc."
            },
            {
                "id": "q7",
                "question": "Tại sao cha mẹ bắt buộc phải 'Hiểu cách trẻ nghĩ và cảm nhận' (Khối 3)?",
                "options": [
                    "Để biết cách đọc suy nghĩ và giám sát hành vi của con mà không để con nhận ra.",
                    "Vì não bộ và nhận thức của trẻ khác người lớn; hiểu trẻ giúp cha mẹ không gán ghép động cơ xấu cho hành vi của trẻ.",
                    "Để cha mẹ có thể tranh luận và giành chiến thắng trước mọi lý lẽ ngây ngô của trẻ.",
                    "Để so sánh mức độ thông minh của con mình với các đứa trẻ khác trong khu phố."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ em không phải là người lớn thu nhỏ. Hành vi của trẻ bắt nguồn từ mức độ phát triển não bộ và cảm xúc của từng lứa tuổi. Hiểu điều này giúp cha mẹ kiên nhẫn và không coi hành vi của trẻ là cố tình chống đối."
            },
            {
                "id": "q8",
                "question": "Khối thứ tư - 'Giải quyết vấn đề' - được thực hiện trên nguyên tắc nào?",
                "options": [
                    "Tìm xem ai là người có lỗi lớn nhất trong nhà để trừng phạt công khai.",
                    "Phân tích nguyên nhân đằng sau tình huống xung đột và áp dụng cả ấm áp lẫn cấu trúc phù hợp với độ tuổi.",
                    "Mặc kệ xung đột tự qua đi theo thời gian mà không cần can thiệp.",
                    "Dùng quyền uy tối thượng của cha mẹ để dập tắt ngay lập tức mọi ý kiến phản đối của trẻ."
                ],
                "correctIndex": 1,
                "explanation": "Giải quyết vấn đề là quá trình tìm hiểu nguyên nhân gốc rễ dẫn đến hành vi của trẻ, sau đó kết hợp cả sự ấm áp và cấu trúc thích hợp để tìm ra giải pháp học tập tích cực."
            },
            {
                "id": "q9",
                "question": "Phương pháp Kỷ luật tích cực áp dụng cho lứa tuổi nào của trẻ?",
                "options": [
                    "Chỉ áp dụng cho trẻ mẫu giáo từ 3 đến 5 tuổi.",
                    "Chỉ áp dụng cho trẻ vị thành niên từ 14 đến 18 tuổi.",
                    "Áp dụng xuyên suốt cho trẻ từ lúc mới sinh (0 tuổi) cho đến khi trưởng thành (18 tuổi).",
                    "Chỉ áp dụng khi trẻ đã biết nói và có khả năng đọc viết thành thạo."
                ],
                "correctIndex": 2,
                "explanation": "Kỷ luật tích cực là nguyên lý đồng hành toàn diện trong suốt quá trình trưởng thành của trẻ, từ sơ sinh 0 tuổi cho đến 18 tuổi."
            },
            {
                "id": "q10",
                "question": "Điểm khác biệt căn bản giữa phản ứng trừng phạt tức thời và phản ứng bằng Kỷ luật tích cực là gì?",
                "options": [
                    "Trừng phạt dập tắt hành vi bằng nỗi sợ hãi; Kỷ luật tích cực nuôi dưỡng nhận thức tự giác và gìn giữ sự gắn kết.",
                    "Trừng phạt không tốn thời gian; Kỷ luật tích cực chỉ dành cho những gia đình có chuyên gia tâm lý.",
                    "Trừng phạt giúp trẻ yêu thương cha mẹ nhiều hơn; Kỷ luật tích cực làm trẻ trở nên xa cách.",
                    "Kỷ luật tích cực sử dụng các phần thưởng đắt tiền để mua chuộc sự hợp tác của trẻ."
                ],
                "correctIndex": 0,
                "explanation": "Đòn roi hay quát tháo có thể làm trẻ ngưng hành vi tức thời do sợ hãi, nhưng để lại vết thương tâm lý và làm xói mòn lòng tin. Kỷ luật tích cực giúp trẻ hiểu bản chất hành vi và phát triển tính tự giác suốt đời."
            }
        ]
    },
    "01_chuong_1": {
        "chapterTitle": "Chương 1: Xác định mục tiêu lâu dài của bạn",
        "questions": [
            {
                "id": "q1",
                "question": "Thách thức phổ biến nhất của các bậc cha mẹ trong những tình huống căng thẳng buổi sáng (như con mè nheo, chậm trễ chuẩn bị đến trường) là gì?",
                "options": [
                    "Họ quá quan tâm đến kế hoạch 20 năm sau của con.",
                    "Họ bị cuốn vào mục tiêu ngắn hạn (khiến con nghe lời ngay lập tức) và bộc phát cơn giận dữ.",
                    "Họ thường xuyên chuẩn bị bài tập về nhà thay cho con cái.",
                    "Họ bỏ qua việc chuẩn bị bữa ăn sáng cho gia đình."
                ],
                "correctIndex": 1,
                "explanation": "Khi đối mặt với áp lực thời gian và căng thẳng, cha mẹ thường tập trung vào mục tiêu ngắn hạn tức thời (muốn con mặc đồ ngay, không quấy khóc) và dễ dùng đến quát mắng, đe dọa."
            },
            {
                "id": "q2",
                "question": "Mục tiêu ngắn hạn (short-term goals) trong nuôi dạy con thường có đặc điểm gì?",
                "options": [
                    "Hướng tới việc hình thành nhân cách đạo đức vững chắc cho trẻ suốt đời.",
                    "Nhằm giải quyết ngay lập tức tình huống trước mắt, buộc trẻ dừng hành vi hoặc vâng lời tức thì.",
                    "Được xây dựng dựa trên sự bàn bạc kỹ lưỡng giữa cha mẹ và các chuyên gia giáo dục.",
                    "Giúp trẻ thấu hiểu nguyên lý khoa học đằng sau các hiện tượng tự nhiên."
                ],
                "correctIndex": 1,
                "explanation": "Mục tiêu ngắn hạn phản ánh nhu cầu kiểm soát tình huống ngay tại thời điểm đó: muốn trẻ dọn phòng ngay, im lặng ngay, hoặc ăn hết chén cơm ngay."
            },
            {
                "id": "q3",
                "question": "Mục tiêu dài hạn (long-term goals) của cha mẹ được hình thành bằng cách trả lời câu hỏi nào?",
                "options": [
                    "Làm sao để phạt con thật nặng để con không bao giờ tái phạm?",
                    "Khi con tôi 20 tuổi, tôi mong muốn con trở thành một con người có những phẩm chất gì?",
                    "Tôi có thể bắt con học trường nào để có thu nhập cao nhất?",
                    "Làm thế nào để con tôi luôn ngoan ngoãn tuyệt đối và không bao giờ cãi lại tôi?"
                ],
                "correctIndex": 1,
                "explanation": "Bài tập nền tảng của Chương 1 yêu cầu cha mẹ hình dung đứa con ở tuổi 20: Bạn muốn con là người tự tin, trung thực, biết cảm thông, tự lập và giải quyết xung đột bằng hòa bình hay sợ hãi và lừa dối?"
            },
            {
                "id": "q4",
                "question": "Những phẩm chất nào sau đây thuộc về mục tiêu dài hạn đáng mong ước mà hầu hết cha mẹ đều hy vọng con mình có được ở tuổi 20?",
                "options": [
                    "Biết vâng lời một cách mù quáng, rụt rè và luôn che giấu lỗi lầm vì sợ bị đòn.",
                    "Tự trọng, trung thực, có lòng trắc ẩn, kiên cường vượt khó và biết cách hòa giải bất đồng.",
                    "Biết cách tranh giành quyền lợi bằng mọi giá và lấn át người khác trong giao tiếp.",
                    "Phụ thuộc hoàn toàn vào quyết định của cha mẹ ngay cả khi đã lập gia đình."
                ],
                "correctIndex": 1,
                "explanation": "Cha mẹ đều mong muốn con lớn lên trở thành người có đạo đức, tự chủ, tự tin, biết yêu thương, có khả năng giải quyết mâu thuẫn trong hòa bình và có trách nhiệm với xã hội."
            },
            {
                "id": "q5",
                "question": "Hệ quả tiêu cực nếu cha mẹ chỉ liên tục sử dụng các biện pháp ngắn hạn thô bạo (quát tháo, đánh đập) để kiểm soát con là gì?",
                "options": [
                    "Trẻ sẽ học được cách trở nên tự tin và dũng cảm hơn khi ra ngoài xã hội.",
                    "Trẻ học được rằng bạo lực và sức mạnh thể chất là cách hợp thức để giải quyết xung đột.",
                    "Trẻ sẽ tự động phát triển tư duy logic và kỹ năng lãnh đạo xuất chúng.",
                    "Mối quan hệ gia đình sẽ trở nên vô cùng gắn kết và thấu hiểu lẫn nhau."
                ],
                "correctIndex": 1,
                "explanation": "Khi bị trừng phạt bằng bạo lực, trẻ sẽ học theo tấm gương của cha mẹ: người lớn hơn, mạnh hơn có quyền ức hiếp người nhỏ bé hơn, dẫn đến xu hướng bạo lực hoặc sợ sệt, lừa dối khi lớn lên."
            },
            {
                "id": "q6",
                "question": "Làm thế nào để cha mẹ có thể kết nối giữa mục tiêu ngắn hạn và mục tiêu dài hạn?",
                "options": [
                    "Bỏ qua hoàn toàn các mục tiêu ngắn hạn và để nhà cửa lộn xộn, con cái bỏ học.",
                    "Xem mỗi tình huống xung đột hàng ngày như một cơ hội quý báu để giảng dạy các bài học dài hạn.",
                    "Phạt thật nặng trong ngắn hạn rồi sau đó xin lỗi con vào cuối ngày.",
                    "Giao toàn bộ quyền kỷ luật con cho nhà trường và giáo viên chủ nhiệm."
                ],
                "correctIndex": 1,
                "explanation": "Bí quyết của Kỷ luật tích cực là biến những khoảnh khắc khủng hoảng hàng ngày (con làm vỡ đồ, con tranh giành) thành bài học thực tế để dạy con cách chịu trách nhiệm, sửa sai và hòa giải."
            },
            {
                "id": "q7",
                "question": "Khi bạn muốn con mình trở thành người biết tôn trọng người khác ở tuổi 20, trong hiện tại bạn cần đối xử với con như thế nào?",
                "options": [
                    "Quát mắng và sỉ nhục con trước mặt mọi người để rèn luyện sự chịu đựng.",
                    "Tôn trọng phẩm giá của con ngay cả khi con phạm sai lầm hoặc chưa làm tốt.",
                    "Không cần nói chuyện với con, chỉ cần mua thật nhiều sách dạy đạo đức cho con đọc.",
                    "Luôn coi thường ý kiến của con vì con còn quá nhỏ chưa biết gì."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ em học từ những gì cha mẹ làm chứ không chỉ những gì cha mẹ nói. Để dạy con sự tôn trọng, cha mẹ phải làm mẫu bằng cách tôn trọng con ngay cả trong những khoảnh khắc kỷ luật."
            },
            {
                "id": "q8",
                "question": "Theo nghiên cứu trong tài liệu, việc dùng bạo lực thể xác tác động như thế nào đến khả năng tự kiểm soát của trẻ?",
                "options": [
                    "Làm tăng khả năng tự kiểm soát và tự giác rất nhanh chóng.",
                    "Làm suy yếu khả năng tự kiểm soát vì trẻ chỉ hành động dựa trên nỗi sợ bị bắt gặp thay vì hiểu giá trị đạo đức.",
                    "Không có bất kỳ ảnh hưởng nào đến sự phát triển nhân cách của trẻ.",
                    "Giúp trẻ trở nên thông minh và có chỉ số IQ cao hơn bình thường."
                ],
                "correctIndex": 1,
                "explanation": "Trừng phạt thể xác cản trở sự phát triển của cơ chế kiểm soát nội tâm. Trẻ chỉ tuân thủ khi có mặt người lớn cầm roi, và khi không có ai giám sát, trẻ sẽ dễ dàng phá vỡ quy tắc."
            },
            {
                "id": "q9",
                "question": "Một người cha tức giận vì đứa con 4 tuổi làm đổ sữa ra sàn. Phản ứng nào thể hiện sự tập trung vào 'mục tiêu dài hạn'?",
                "options": [
                    "Tát vào tay con và quát: 'Mày lúc nào cũng vụng về ăn hại! Đứng phạt vào góc!'",
                    "Bình tĩnh nói: 'Sữa đổ rồi, không sao con. Lấy giẻ đây hai bố con mình cùng lau sạch nhé.'",
                    "Đánh đòn để lần sau con không bao giờ dám tự cầm cốc uống sữa nữa.",
                    "Cấm con không được uống sữa trong suốt một tuần tiếp theo."
                ],
                "correctIndex": 1,
                "explanation": "Phản ứng bình tĩnh và hướng dẫn con lau dọn dạy con kỹ năng khắc phục hậu quả, lòng dũng cảm đối diện với sai sót mà không sợ hãi, hướng tới mục tiêu dài hạn là một con người có trách nhiệm."
            },
            {
                "id": "q10",
                "question": "Thông điệp cốt lõi của Chương 1 có thể tóm gọn lại là gì?",
                "options": [
                    "Hãy nuôi dạy con bằng cách phản xạ tự nhiên theo cảm xúc từng giây phút.",
                    "Mọi hành động kỷ luật hôm nay đều đang trực tiếp điêu khắc nên con người của đứa trẻ ở tuổi trưởng thành.",
                    "Cha mẹ không nên kỳ vọng bất cứ điều gì vào tương lai của con cái để tránh thất vọng.",
                    "Mục tiêu ngắn hạn luôn quan trọng hơn mục tiêu dài hạn vì hiện tại quyết định tất cả."
                ],
                "correctIndex": 1,
                "explanation": "Mỗi phản ứng kỷ luật hàng ngày chính là những viên gạch xây dựng nên tính cách, nhân phẩm và lối sống của đứa trẻ khi bước vào tuổi 20."
            }
        ]
    },
    "02_chuong_2": {
        "chapterTitle": "Chương 2: Tạo sự ấm áp và cấu trúc",
        "questions": [
            {
                "id": "q1",
                "question": "Hai công cụ cốt lõi song hành cùng nhau để xây dựng các kỹ năng kỷ luật tích cực là gì?",
                "options": [
                    "Sự trừng phạt và phần thưởng vật chất.",
                    "Tạo sự ấm áp và thiết lập cấu trúc.",
                    "Sự giám sát nghiêm ngặt và biện pháp cách ly.",
                    "Lời khen ngợi tâng bốc và sự nhượng bộ hoàn toàn."
                ],
                "correctIndex": 1,
                "explanation": "Sự ấm áp (Warmth) và Cấu trúc (Structure) là hai trụ cột song hành không thể tách rời, tạo nên môi trường giáo dục an toàn và hiệu quả nhất cho trẻ."
            },
            {
                "id": "q2",
                "question": "Hành vi nào sau đây thể hiện rõ nét 'Sự ấm áp' của cha mẹ dành cho con?",
                "options": [
                    "Lắng nghe con với sự đồng cảm, ôm ấp, khích lệ và yêu thương con ngay cả khi con làm sai.",
                    "Mua cho con tất cả các món đồ chơi đắt tiền mà con yêu cầu trên mạng.",
                    "Không bao giờ nhắc nhở hay chỉnh sửa bất kỳ hành vi sai trái nào của con.",
                    "Làm hộ con toàn bộ bài tập và công việc cá nhân của con."
                ],
                "correctIndex": 0,
                "explanation": "Ấm áp thể hiện qua sự yêu thương vô điều kiện, lắng nghe chăm chú, vỗ về khi trẻ buồn, tin tưởng và khích lệ nỗ lực của trẻ, giúp trẻ cảm nhận sự an toàn tình cảm vững chắc."
            },
            {
                "id": "q3",
                "question": "Tại sao sự ấm áp lại là điều kiện tiên quyết để việc kỷ luật mang lại kết quả tích cực?",
                "options": [
                    "Vì khi trẻ cảm thấy an toàn và được yêu thương, não bộ trẻ cởi mở để tiếp thu và học hỏi thay vì phòng thủ.",
                    "Vì sự ấm áp sẽ khiến trẻ cảm thấy có lỗi và sợ làm cha mẹ thất vọng.",
                    "Vì cha mẹ ấm áp thì trẻ sẽ không bao giờ dám đòi hỏi bất cứ điều gì nữa.",
                    "Vì trẻ con chỉ thích nghe lời những người hay cho kẹo và tặng quà."
                ],
                "correctIndex": 0,
                "explanation": "Về mặt thần kinh học, khi trẻ cảm thấy được yêu thương và tôn trọng, lượng hormone căng thẳng giảm xuống, vùng não tư duy cao cấp hoạt động tối ưu, giúp trẻ thấu hiểu và ghi nhớ bài học."
            },
            {
                "id": "q4",
                "question": "'Cấu trúc' trong phương pháp Kỷ luật tích cực được hiểu chính xác là gì?",
                "options": [
                    "Hệ thống tường rào và camera giám sát mọi sinh hoạt của trẻ trong phòng.",
                    "Bộ hướng dẫn rõ ràng về kỳ vọng, ranh giới hành vi, lý giải nguyên nhân và hỗ trợ con sửa sai.",
                    "Một danh sách các hình phạt tăng dần tương ứng với từng lỗi vi phạm của trẻ.",
                    "Khuôn mẫu cứng nhắc bắt buộc trẻ phải làm theo y hệt mọi thói quen của người lớn."
                ],
                "correctIndex": 1,
                "explanation": "Cấu trúc là sự định hướng rõ ràng: giải thích lý do vì sao có quy tắc, hướng dẫn con cách làm đúng từng bước, đặt ra giới hạn an toàn và hỗ trợ con tìm cách sửa chữa sai lầm."
            },
            {
                "id": "q5",
                "question": "Hành vi nào sau đây là ví dụ tiêu biểu cho việc 'Thiết lập cấu trúc' hiệu quả?",
                "options": [
                    "Cấm con không được chơi điện thoại mãi mãi mà không giải thích gì thêm.",
                    "Cùng con thảo luận và thống nhất quy định sử dụng thiết bị 30 phút sau khi hoàn thành bài tập, có hẹn giờ chuông báo.",
                    "Tịch thu máy tính của con và ném xuống đất khi con lỡ chơi quá 5 phút.",
                    "Để con tự do chơi game thâu đêm vì không muốn làm mất hòa khí trong nhà."
                ],
                "correctIndex": 1,
                "explanation": "Thiết lập cấu trúc hiệu quả là cùng con xây dựng quy tắc minh bạch, giải thích lý do bảo vệ sức khỏe, có thỏa thuận trước và công cụ hỗ trợ trẻ tự giác thực hiện."
            },
            {
                "id": "q6",
                "question": "Điều gì sẽ xảy ra nếu cha mẹ chỉ cho con 'Sự ấm áp' mà KHÔNG có 'Cấu trúc'?",
                "options": [
                    "Con sẽ trở nên rất kỷ luật và tự giác cao trong mọi việc.",
                    "Con sẽ thiếu ranh giới, bối rối không biết hành vi nào là đúng/sai và có xu hướng đòi hỏi, thiếu tự chủ.",
                    "Con sẽ luôn sợ hãi và rụt rè trước những thử thách mới ngoài xã hội.",
                    "Con sẽ phát triển vượt bậc về tư duy logic và toán học."
                ],
                "correctIndex": 1,
                "explanation": "Yêu thương mà không có cấu trúc dẫn đến phong cách nuông chiều (permissive parenting). Trẻ lớn lên thiếu kỹ năng tự điều chỉnh, dễ bốc đồng và gặp khó khăn trong việc thích nghi với các quy tắc xã hội."
            },
            {
                "id": "q7",
                "question": "Điều gì sẽ xảy ra nếu cha mẹ chỉ áp đặt 'Cấu trúc' nghiêm khắc mà KHÔNG có 'Sự ấm áp'?",
                "options": [
                    "Trẻ sẽ cảm thấy vô cùng hạnh phúc và biết ơn sự nghiêm khắc của cha mẹ.",
                    "Trẻ trở nên xa lánh, mất kết nối tình cảm, vâng lời vì sợ hãi hoặc âm thầm nổi loạn, lừa dối.",
                    "Trẻ sẽ tự tin trở thành nhà lãnh đạo tài ba được mọi người kính trọng.",
                    "Gia đình sẽ luôn tràn ngập tiếng cười và sự cởi mở chia sẻ tâm tư."
                ],
                "correctIndex": 1,
                "explanation": "Cấu trúc mà không có ấm áp chính là phong cách độc đoán (authoritarian parenting). Trẻ sống trong sợ hãi, dễ mắc lo âu, thiếu tự tin hoặc nổi loạn chống đối khi thoát khỏi tầm kiểm soát."
            },
            {
                "id": "q8",
                "question": "Phong cách làm cha mẹ kết hợp cân bằng giữa 'Ấm áp cao' và 'Cấu trúc cao' mang lại kết quả gì cho trẻ?",
                "options": [
                    "Trẻ phát triển tự tin, tự giác, có trách nhiệm, khả năng thấu cảm và năng lực xã hội vượt trội.",
                    "Trẻ sẽ trở nên ỷ lại và không bao giờ chịu rời xa cha mẹ khi lớn lên.",
                    "Trẻ sẽ không có cá tính riêng vì luôn tuân theo những hướng dẫn của cha mẹ.",
                    "Trẻ sẽ gặp khó khăn trong việc thể hiện cảm xúc cá nhân ra bên ngoài."
                ],
                "correctIndex": 0,
                "explanation": "Đây là phong cách đồng hành lý tưởng (authoritative/positive parenting) được khoa học chứng minh giúp trẻ đạt được thành tựu học tập tốt nhất, sức khỏe tâm thần lành mạnh và hạnh phúc lâu dài."
            },
            {
                "id": "q9",
                "question": "Khi giải thích lý do cho một quy tắc an toàn (ví dụ: 'Không được chạy qua đường khi chưa có người lớn dắt'), cha mẹ đang cung cấp yếu tố nào?",
                "options": [
                    "Chỉ cung cấp sự trừng phạt mang tính cảnh cáo.",
                    "Cung cấp cấu trúc thông tin giúp trẻ hiểu nguyên nhân và xây dựng tư duy an toàn cho bản thân.",
                    "Đang làm suy giảm quyền tự do đi lại và khám phá của trẻ em.",
                    "Cung cấp phần thưởng để dụ dỗ con nghe lời."
                ],
                "correctIndex": 1,
                "explanation": "Giải thích lý do đằng sau các giới hạn chính là trao cho con cấu trúc tri thức, giúp con hiểu bản chất vấn đề thay vì chỉ biết tuân lệnh máy móc."
            },
            {
                "id": "q10",
                "question": "Làm mẫu tích cực (positive role modeling) đóng vai trò như thế nào trong việc tạo cấu trúc?",
                "options": [
                    "Không có vai trò gì vì trẻ chỉ học qua những bài kiểm tra bằng văn bản.",
                    "Là cách dạy cấu trúc mạnh mẽ nhất vì trẻ quan sát và bắt chước cách cha mẹ xử lý cảm xúc và tuân thủ quy tắc.",
                    "Chỉ có tác dụng đối với những đứa trẻ dưới 1 tuổi.",
                    "Làm mẫu chỉ khiến cha mẹ thêm mệt mỏi mà không mang lại lợi ích giáo dục nào."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ học cách giải quyết xung đột bằng hòa bình khi thấy cha mẹ giải quyết bất đồng trong hòa bình; học sự trung thực khi thấy cha mẹ trung thực. Hành vi làm mẫu là cấu trúc sống động nhất."
            },
            {
                "id": "q11",
                "question": "Khi trẻ đang khóc lóc giận dữ vì không được mua món đồ chơi ưa thích trong siêu thị, bước đầu tiên thể hiện 'Sự ấm áp' là gì?",
                "options": [
                    "Mắng con ngay lập tức: 'Nín ngay, không tao tát cho vỡ mặt bây giờ!'",
                    "Thừa nhận cảm xúc của con: 'Mẹ biết con rất thích món đồ chơi này và con đang cảm thấy rất tiếc nuối.'",
                    "Bỏ mặc con nằm lăn lộn giữa lối đi và đi về nhà một mình.",
                    "Mua ngay món đồ chơi đó để dẹp yên sự xấu hổ trước đám đông."
                ],
                "correctIndex": 1,
                "explanation": "Thừa nhận và gọi tên cảm xúc ('Mẹ biết con đang rất tiếc và buồn...') trao cho con sự ấm áp, giúp con xoa dịu hệ thần kinh cảm xúc trước khi áp dụng cấu trúc ranh giới ('nhưng hôm nay chúng ta không mua đồ chơi')."
            },
            {
                "id": "q12",
                "question": "Tạo cấu trúc khi con mắc lỗi (ví dụ làm gãy bút chì của bạn) bao gồm hành động nào đúng đắn nhất?",
                "options": [
                    "Đánh đòn đau để con nhớ đời và không bao giờ dám mượn đồ của ai nữa.",
                    "Bắt đền bạn một hộp bút mới và cấm con không được chơi với người bạn đó nữa.",
                    "Cùng con nói lời xin lỗi bạn và hướng dẫn con gọt lại bút chì hoặc mang một chiếc bút khác đền cho bạn.",
                    "Lờ đi và nói với con rằng bạn bè thì không nên so đo những chuyện vặt vãnh."
                ],
                "correctIndex": 2,
                "explanation": "Cấu trúc hướng dẫn sửa sai dạy trẻ kỹ năng sống thực tế: nhận trách nhiệm, nói lời xin lỗi chân thành và chủ động hành động để bồi thường thiệt hại cho người khác."
            }
        ]
    },
    "03_chuong_3": {
        "chapterTitle": "Chương 3: Hiểu cách trẻ nghĩ và cảm nhận",
        "questions": [
            {
                "id": "q1",
                "question": "Khối xây dựng thứ 3 - 'Hiểu cách trẻ nghĩ và cảm nhận' - đóng vai trò như thế nào đối với cha mẹ?",
                "options": [
                    "Giúp cha mẹ nhìn thế giới qua đôi mắt của trẻ theo từng độ tuổi để thấu hiểu căn nguyên hành vi của con.",
                    "Giúp cha mẹ đoán trước tương lai nghề nghiệp của con khi trưởng thành.",
                    "Giúp cha mẹ áp dụng cùng một khuôn mẫu kỷ luật cho mọi lứa tuổi từ sơ sinh đến vị thành niên.",
                    "Giúp kiểm tra xem chỉ số thông minh (IQ) của con có vượt trội so với bạn bè cùng trang lứa hay không."
                ],
                "correctIndex": 0,
                "explanation": "Mỗi giai đoạn phát triển, não bộ của trẻ có những giới hạn và đặc điểm riêng. Nhìn nhận thế giới qua lăng kính của trẻ giúp cha mẹ tránh việc kỳ vọng phi thực tế và nổi giận vô cớ."
            },
            {
                "id": "q2",
                "question": "Đối với trẻ từ 0 đến 6 tháng tuổi, tiếng khóc của trẻ mang ý nghĩa gì?",
                "options": [
                    "Là hành vi cố tình quấy nhiễu và thao túng tinh thần cha mẹ để được bế ẵm.",
                    "Là phương tiện giao tiếp duy nhất để báo hiệu nhu cầu sinh tồn (đói, ướt, mệt, đau, cần hơi ấm).",
                    "Là biểu hiện của sự bướng bỉnh và khó tính bẩm sinh cần phải uốn nắn từ nhỏ.",
                    "Là dấu hiệu cho thấy trẻ đang đòi hỏi quyền làm chủ trong gia đình."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ dưới 6 tháng tuổi chưa phát triển vùng não cho phép lên kế hoạch thao túng. Tiếng khóc đơn thuần là phản xạ sinh học để thông báo một nhu cầu cơ thể hoặc nhu cầu an toàn chưa được đáp ứng."
            },
            {
                "id": "q3",
                "question": "Hành động nào sau đây là NGUY HIỂM TUYỆT ĐỐI khi dỗ một em bé sơ sinh đang quấy khóc?",
                "options": [
                    "Bế trẻ lên và đung đưa nhẹ nhàng theo nhịp tim.",
                    "Hát ru êm dịu hoặc bật tiếng ồn trắng (white noise).",
                    "Rung lắc mạnh đứa trẻ vì quá tức giận và mất kiên nhẫn.",
                    "Kiểm tra tã lót xem có bị ướt hay bị phân dính vào da không."
                ],
                "correctIndex": 2,
                "explanation": "Rung lắc trẻ sơ sinh có thể gây ra 'Hội chứng rung lắc' (Shaken Baby Syndrome) cực kỳ nguy hiểm, dẫn đến tổn thương não vĩnh viễn, mù lòa hoặc thậm chí tử vong do cơ cổ của trẻ còn rất yếu."
            },
            {
                "id": "q4",
                "question": "Ở giai đoạn 6 đến 12 tháng tuổi, tại sao trẻ thường xuyên ném đồ chơi hoặc đập thìa xuống sàn nhiều lần?",
                "options": [
                    "Vì trẻ muốn thử thách lòng kiên nhẫn của cha mẹ và cố ý phá hoại đồ đạc.",
                    "Vì trẻ đang khám phá nguyên lý nguyên nhân - kết quả (mình buông tay thì đồ sẽ rơi và phát ra tiếng động).",
                    "Vì trẻ ghét món đồ chơi đó và muốn cha mẹ mua đồ mới.",
                    "Vì cơ tay của trẻ bị co giật mất kiểm soát do thiếu canxi."
                ],
                "correctIndex": 1,
                "explanation": "Đây là giai đoạn trẻ như một nhà khoa học tí hon thử nghiệm các quy luật vật lý: sự rơi của vật thể, âm thanh tạo ra khi va chạm và phản ứng của người lớn khi nhặt đồ lên."
            },
            {
                "id": "q5",
                "question": "Đặc điểm tâm lý nổi bật nhất của trẻ ở độ tuổi chập chững (1 đến 2 tuổi) là gì?",
                "options": [
                    "Khả năng tư duy trừu tượng và đồng cảm sâu sắc với nỗi đau của người khác.",
                    "Mong muốn khám phá độc lập rất mạnh mẽ nhưng ngôn ngữ và khả năng tự kiểm soát còn rất sơ khai.",
                    "Thích ngồi yên một chỗ để tập trung đọc sách và nghe thuyết trình suốt nhiều giờ.",
                    "Luôn biết nhường nhịn đồ chơi cho bạn bè và hiểu rõ khái niệm sở hữu công cộng."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ 1-2 tuổi bắt đầu biết đi, có nhu cầu khám phá mãnh liệt nhưng chưa có nhận thức về nguy hiểm và chưa có ngôn ngữ để biểu đạt cảm xúc, dẫn đến sự bực bội khi bị ngăn cản."
            },
            {
                "id": "q6",
                "question": "Tại sao trẻ 2 đến 3 tuổi rất thường xuyên nói từ 'KHÔNG!' trước mọi lời đề nghị của cha mẹ?",
                "options": [
                    "Vì trẻ đang luyện tập tính khẳng định bản thân và nhận thức mình là một cá thể độc lập.",
                    "Vì trẻ đã bị người xấu tiêm nhiễm thói chống đối xã hội nguy hiểm.",
                    "Vì thính giác của trẻ có vấn đề nên không nghe rõ lời người lớn nói.",
                    "Vì trẻ muốn thể hiện quyền lực tối cao để thống trị cả gia đình."
                ],
                "correctIndex": 0,
                "explanation": "Nói 'Không' là cột mốc phát triển tâm lý quan trọng: trẻ bắt đầu ý thức được 'cái tôi' riêng biệt của mình, không còn hòa lẫn làm một với cha mẹ. Đó là sự trưởng thành về nhân cách, không phải sự xấc xược."
            },
            {
                "id": "q7",
                "question": "Khái niệm 'Tư duy duy kỷ' (Egocentrism) ở trẻ từ 3 đến 5 tuổi có nghĩa là gì?",
                "options": [
                    "Trẻ rất ích kỷ, độc ác và không bao giờ muốn chia sẻ bất cứ thứ gì cho ai.",
                    "Trẻ nhìn mọi sự vật hoàn toàn từ góc nhìn cá nhân của mình và chưa thể hình dung được góc nhìn của người khác.",
                    "Trẻ chỉ biết yêu bản thân và mắc chứng ái kỷ bẩm sinh không thể chữa khỏi.",
                    "Trẻ luôn đòi hỏi mình phải là trung tâm vũ trụ trong mọi cuộc họp quốc tế."
                ],
                "correctIndex": 1,
                "explanation": "Theo tâm lý học phát triển của Jean Piaget, tư duy duy kỷ ở lứa tuổi mầm non là đặc điểm nhận thức tự nhiên: trẻ tưởng rằng ai cũng nhìn thấy, nghe thấy và cảm nhận y hệt như những gì trẻ đang trải nghiệm."
            },
            {
                "id": "q8",
                "question": "Ở lứa tuổi tiểu học (5 đến 9 tuổi), bước tiến lớn nhất trong nhận thức của trẻ là gì?",
                "options": [
                    "Bắt đầu hiểu rõ quy tắc trò chơi, khái niệm công bằng và có khả năng đặt mình vào vị trí của bạn bè.",
                    "Có thể sống tự lập hoàn toàn mà không cần bất kỳ sự chăm sóc nào từ cha mẹ.",
                    "Hoàn thiện 100% các cấu trúc tế bào thần kinh của vùng não thùy trán.",
                    "Không còn cảm thấy sợ hãi hay lo âu trước bất kỳ tình huống bất ngờ nào."
                ],
                "correctIndex": 0,
                "explanation": "Trẻ 5-9 tuổi bước vào giai đoạn phát triển ý thức xã hội mạnh mẽ: trẻ rất nhạy cảm với khái niệm 'công bằng', học cách chơi theo luật và bắt đầu biết đồng cảm sâu sắc hơn."
            },
            {
                "id": "q9",
                "question": "Khi trẻ 5-9 tuổi có biểu hiện nói dối (ví dụ: giấu bài kiểm tra điểm kém hoặc chối không làm vỡ bình hoa), động cơ sâu xa nhất thường là gì?",
                "options": [
                    "Bản chất độc ác muốn lừa gạt mọi người xung quanh để trục lợi cá nhân.",
                    "Nỗi sợ hãi mãnh liệt bị cha mẹ trừng phạt, mắng nhiếc hoặc làm cha mẹ thất vọng, mất đi tình yêu thương.",
                    "Do trẻ không phân biệt được đâu là đồ gốm sứ và đâu là giấy viết.",
                    "Do trẻ muốn thách thức thẩm quyền của hệ thống pháp luật nhà nước."
                ],
                "correctIndex": 1,
                "explanation": "Đa phần trẻ em nói dối vì sợ hãi đòn roi, sợ bị sỉ nhục hoặc sợ mất đi sự ấm áp yêu thương của cha mẹ. Nếu cha mẹ tạo môi trường an toàn, trẻ sẽ dũng cảm nhận lỗi và nói thật."
            },
            {
                "id": "q10",
                "question": "Ở độ tuổi 10 đến 13 tuổi (bước vào tiền dậy thì), trẻ thường có sự thay đổi tâm sinh lý nào rõ rệt?",
                "options": [
                    "Sự bùng nổ hormone, nhạy cảm cao độ với ngoại hình, bắt đầu hướng về bạn bè cùng trang lứa và muốn có sự riêng tư.",
                    "Trở lại hoàn toàn phụ thuộc vào cha mẹ như trẻ sơ sinh 6 tháng tuổi.",
                    "Mất hoàn toàn khả năng ghi nhớ từ vựng và toán học căn bản.",
                    "Không còn quan tâm đến ý kiến hay sự đánh giá của bạn bè cùng lớp."
                ],
                "correctIndex": 0,
                "explanation": "Tuổi dậy thì đem đến những biến đổi hormone mạnh mẽ. Trẻ bắt đầu định hình bản sắc cá nhân, rất chú ý đến hình ảnh bản thân trong mắt bạn bè và có nhu cầu không gian riêng tư cao."
            },
            {
                "id": "q11",
                "question": "Tại sao thanh thiếu niên (14 đến 18 tuổi) thường có những hành vi liều lĩnh, bốc đồng hoặc cảm xúc thất thường?",
                "options": [
                    "Vì não bộ của trẻ ở tuổi này đã ngừng phát triển hoàn toàn từ năm 12 tuổi.",
                    "Vì vùng não cảm xúc (hạch hạnh nhân) phát triển nhanh hơn vùng não kiểm soát hành vi và phán đoán rủi ro (vỏ não trước trán).",
                    "Vì tất cả thanh thiếu niên đều bị rối loạn hành vi do tiếp xúc với mạng internet.",
                    "Vì trẻ muốn cố tình hủy hoại danh tiếng của gia đình và dòng họ."
                ],
                "correctIndex": 1,
                "explanation": "Khoa học não bộ hiện đại đã chứng minh: Vỏ não trước trán (chịu trách nhiệm lập kế hoạch, kiểm soát xung động và cân nhắc hậu quả) chỉ hoàn thiện vào khoảng tuổi 25, trong khi hệ thống cảm xúc đã phát triển rất mạnh."
            },
            {
                "id": "q12",
                "question": "'Khí chất' (Temperament) của một đứa trẻ có nghĩa là gì?",
                "options": [
                    "Học lực và bảng điểm các môn tự nhiên của trẻ ở trường lớp.",
                    "Đặc điểm sinh học bẩm sinh quyết định cách trẻ phản ứng với thế giới xung quanh (nhạy cảm, năng động, dễ thích nghi hay dè dặt).",
                    "Hình phạt nặng nhất mà đứa trẻ từng phải trải qua trong đời.",
                    "Khả năng võ thuật và sức mạnh cơ bắp của đứa trẻ khi thi đấu thể thao."
                ],
                "correctIndex": 1,
                "explanation": "Khí chất là phong cách phản ứng bẩm sinh của hệ thần kinh: có trẻ thích nghi nhanh, có trẻ nhút nhát cần thời gian làm quen; có trẻ năng động, có trẻ điềm tĩnh. Cha mẹ cần tôn trọng khí chất tự nhiên của con."
            },
            {
                "id": "q13",
                "question": "Khi cha mẹ có khí chất 'nhanh nhẹn, thích ngăn nắp' nhưng có một đứa con 'chậm rãi, mơ mộng', điều cha mẹ cần làm là gì?",
                "options": [
                    "Bắt ép và quát mắng con mỗi ngày để biến con thành người nhanh nhẹn giống hệt mình.",
                    "Thấu hiểu sự khác biệt về khí chất, kiên nhẫn cho con thêm thời gian và thiết lập cấu trúc hỗ trợ con từng bước.",
                    "Cho rằng đứa trẻ này bị khuyết tật trí tuệ và đưa đi điều trị bằng thuốc an thần.",
                    "Bỏ mặc con hoàn toàn và không quan tâm đến bất kỳ hoạt động nào của con nữa."
                ],
                "correctIndex": 1,
                "explanation": "Hiểu sự tương thích khí chất (goodness of fit) giúp cha mẹ không quy kết tính cách của con là khuyết điểm, mà linh hoạt điều chỉnh nhịp điệu sinh hoạt và tạo cấu trúc hỗ trợ con thích nghi."
            },
            {
                "id": "q14",
                "question": "Trẻ mầm non (3-5 tuổi) sợ bóng tối hoặc sợ quái vật dưới gầm giường là do đâu?",
                "options": [
                    "Do trẻ thực sự nhìn thấy các sinh vật huyền bí mà người lớn không thể thấy được.",
                    "Do trí tưởng tượng phát triển cực kỳ phong phú trong khi ranh giới giữa thực và ảo chưa hoàn toàn rạch ròi.",
                    "Do trẻ đang giả vờ sợ để bắt cha mẹ phải thức trắng đêm phục vụ mình.",
                    "Do hệ thống mắt của trẻ bị suy giảm thị lực nghiêm trọng vào ban đêm."
                ],
                "correctIndex": 1,
                "explanation": "Ở tuổi mẫu giáo, trí tưởng tượng phát triển vượt bậc tạo ra những hình tượng sống động, nhưng tư duy logic chưa đủ để phân biệt rõ thực - ảo, dẫn đến nỗi sợ hãi rất thật đối với trẻ."
            },
            {
                "id": "q15",
                "question": "Cách ứng xử đúng đắn của cha mẹ khi con 4 tuổi hoảng sợ vì 'quái vật trong bóng tối' là gì?",
                "options": [
                    "Chế giễu con: 'Lớn từng này rồi mà hèn nhát thế! Làm gì có quái vật, cấm khóc!'",
                    "Thể hiện sự ấm áp, ôm con, công nhận nỗi sợ của con và cùng con bật đèn kiểm tra phòng để tạo sự an tâm.",
                    "Nhốt con vào phòng tối một mình để rèn luyện lòng can đảm thép.",
                    "Dọa thêm: 'Nếu con không ngoan quái vật sẽ bắt con đi thật đấy!'"
                ],
                "correctIndex": 1,
                "explanation": "Cười nhạo chỉ làm tăng nỗi bất an của trẻ. Sự thấu hiểu và ấm áp (ôm ấp, vỗ về) kết hợp với cấu trúc bảo vệ (cùng kiểm tra phòng, để đèn ngủ nhỏ) giúp trẻ học cách vượt qua nỗi sợ."
            }
        ]
    },
    "04_chuong_4": {
        "chapterTitle": "Chương 4: Giải quyết vấn đề",
        "questions": [
            {
                "id": "q1",
                "question": "Mục tiêu cốt lõi của Khối xây dựng thứ 4 - 'Giải quyết vấn đề' trong Kỷ luật tích cực là gì?",
                "options": [
                    "Tìm cách đè bẹp sự phản kháng của trẻ bằng uy quyền tuyệt đối của cha mẹ.",
                    "Xác định nguyên nhân gốc rễ đằng sau hành vi thách thức của trẻ để đưa ra giải pháp mang tính giảng dạy bền vững.",
                    "Nhanh chóng tìm ra hình phạt thích đáng để kết thúc xung đột trong vòng 30 giây.",
                    "Tránh né hoàn toàn mọi mâu thuẫn bằng cách nhượng bộ mọi yêu sách của con cái."
                ],
                "correctIndex": 1,
                "explanation": "Giải quyết vấn đề đòi hỏi cha mẹ như một thám tử: tìm hiểu 'Tại sao con lại làm như vậy?' dựa trên đặc điểm phát triển lứa tuổi, từ đó giải quyết nguyên nhân thay vì chỉ dập tắt triệu chứng bên ngoài."
            },
            {
                "id": "q2",
                "question": "Trong mô hình giải quyết vấn đề, câu hỏi quan trọng đầu tiên cha mẹ cần tự hỏi mình khi trẻ có hành vi sai là gì?",
                "options": [
                    "'Mình nên dùng roi mây hay dây thắt lưng để đánh phạt con lúc này?'",
                    "'Đứa trẻ ở độ tuổi này đang nghĩ gì, cảm thấy thế nào và tình huống này có ý nghĩa gì đối với con?'",
                    "'Hàng xóm xung quanh sẽ nghĩ gì về danh dự của gia đình mình?'",
                    "'Tại sao số phận lại bắt mình phải nuôi một đứa con khó bảo như thế này?'"
                ],
                "correctIndex": 1,
                "explanation": "Đặt mình vào góc nhìn của trẻ là chìa khóa tháo gỡ xung đột: 'Con đang đói, đang mệt, đang sợ hãi, hay con đang muốn khám phá mà chưa có kỹ năng?'"
            },
            {
                "id": "q3",
                "question": "Khi bé 8 tháng tuổi với tay giật tóc mẹ thật mạnh làm mẹ đau, nguyên nhân thực tế là gì?",
                "options": [
                    "Bé cố ý làm tổn thương mẹ vì không yêu quý mẹ.",
                    "Bé đang thực hành phản xạ nắm bắt, tò mò về xúc giác và chưa hiểu được tóc gắn liền với cơ thể gây đau cho người khác.",
                    "Bé bị rối loạn hành vi bạo lực bẩm sinh cần phải cách ly.",
                    "Bé muốn ép mẹ phải nhường chỗ ngồi cho mình."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ 8 tháng chưa hiểu khái niệm 'nỗi đau của người khác'. Trẻ chỉ thấy một chùm sợi màu đen thú vị và luyện tập cử động cơ tay nắm chặt."
            },
            {
                "id": "q4",
                "question": "Giải pháp tích cực nhất khi trẻ 8 tháng tuổi giật tóc mẹ là gì?",
                "options": [
                    "Tát vào tay trẻ thật mạnh để trẻ biết đau mà chừa.",
                    "Giật lại tóc của trẻ để 'cho nó biết cảm giác bị giật tóc đau thế nào'.",
                    "Nhẹ nhàng gỡ tay trẻ ra, nói êm ái: 'Đau mẹ', và chuyển hướng chú ý của trẻ sang một món đồ chơi mềm để trẻ cầm nắm.",
                    "Bỏ đói trẻ một bữa ăn để răn đe hành vi hung hăng."
                ],
                "correctIndex": 2,
                "explanation": "Gỡ tay nhẹ nhàng, nói ngắn gọn và đánh lạc hướng bằng một đồ vật khác vừa bảo vệ mẹ, vừa thỏa mãn nhu cầu khám phá cầm nắm của trẻ mà không gây hoảng sợ."
            },
            {
                "id": "q5",
                "question": "Trẻ 18 tháng tuổi đang chơi rất vui trong công viên bỗng lăn ra đất gào khóc ăn vạ khi mẹ bảo: 'Đến giờ về rồi con'. Nguyên nhân sâu xa là gì?",
                "options": [
                    "Trẻ bị sốc trước sự chuyển đổi hoạt động đột ngột và chưa có khái niệm thời gian cũng như năng lực kiềm chế cảm xúc.",
                    "Trẻ muốn hạ nhục mẹ trước ánh mắt của những người đang đi dạo trong công viên.",
                    "Trẻ ghét ngôi nhà của mình và không muốn nhìn thấy người thân nữa.",
                    "Trẻ đang cố tình đóng kịch để được quay video đưa lên mạng xã hội."
                ],
                "correctIndex": 0,
                "explanation": "Trẻ nhỏ rất khó chuyển đổi từ hoạt động thú vị sang việc khác nếu không được chuẩn bị trước. Não bộ chưa đủ khả năng kiểm soát sự thất vọng nên bùng nổ thành cơn khóc."
            },
            {
                "id": "q6",
                "question": "Cách thiết lập cấu trúc để phòng ngừa cơn ăn vạ khi rời công viên của trẻ 18 tháng - 2 tuổi là gì?",
                "options": [
                    "Không bao giờ cho con ra công viên chơi nữa.",
                    "Báo trước thời gian bằng hình ảnh/hành động: 'Con chơi cầu trượt thêm 2 lần nữa rồi hai mẹ con mình vẫy tay chào công viên đi về nhé'.",
                    "Bất ngờ bế thốc con chạy thật nhanh ra xe trong lúc con không để ý.",
                    "Hứa mua cho con 5 gói kẹo ngọt mỗi lần con chịu ngoan ngoãn đi về."
                ],
                "correctIndex": 1,
                "explanation": "Đưa ra cấu trúc chuyển giao (transition warning) giúp trẻ chuẩn bị tâm lý trước: đếm số lần trượt hoặc số phút, tạo sự chuyển tiếp êm ả và tôn trọng trải nghiệm của trẻ."
            },
            {
                "id": "q7",
                "question": "Khi hai đứa trẻ 4 tuổi và 6 tuổi tranh giành một món đồ chơi và đánh nhau, cách giải quyết vấn đề tích cực là gì?",
                "options": [
                    "Tịch thu món đồ chơi đem vứt vào sọt rác và đánh đòn cả hai đứa trẻ.",
                    "Tách hai con ra để bình tĩnh, lắng nghe cả hai kể lại, thừa nhận cảm xúc muốn chơi của cả hai và cùng các con bàn cách luân phiên chơi.",
                    "Bắt đứa lớn phải luôn luôn nhường đứa nhỏ vô điều kiện vì 'con là anh/chị'.",
                    "Khuyên đứa nhỏ đánh lại đứa lớn để bảo vệ danh dự cá nhân."
                ],
                "correctIndex": 1,
                "explanation": "Giúp con hạ hỏa, lắng nghe hai phía và hướng dẫn con kỹ năng đàm phán (luân phiên, hẹn giờ đồng hồ cát) dạy trẻ kỹ năng giải quyết mâu thuẫn hòa bình cho suốt cuộc đời."
            },
            {
                "id": "q8",
                "question": "Tại sao câu nói: 'Con là anh lớn, con phải nhường em!' lại thường gây tác dụng ngược trong việc giải quyết xung đột anh em?",
                "options": [
                    "Vì người anh sẽ cảm thấy bất công, bị tước đoạt quyền lợi và nảy sinh lòng ghen ghét, thù hằn đứa em hơn.",
                    "Vì đứa em sẽ trở nên quá thông minh và lấn át toàn bộ gia đình.",
                    "Vì luật pháp quốc tế cấm việc anh em chia sẻ đồ chơi với nhau.",
                    "Vì đứa lớn sẽ không bao giờ chịu lớn lên nữa để được làm em nhỏ."
                ],
                "correctIndex": 0,
                "explanation": "Ép nhường nhịn vô lý tạo ra sự oán giận sâu sắc trong lòng trẻ lớn, khiến trẻ tin rằng cha mẹ thiên vị em, từ đó gia tăng xung đột ngầm và làm rạn nứt tình cảm anh em."
            },
            {
                "id": "q9",
                "question": "Khi trẻ 7 tuổi từ chối làm bài tập về nhà và ngồi lì trước bàn học, bước đầu tiên để giải quyết vấn đề là gì?",
                "options": [
                    "Ngồi vào bàn, quát mắng và bắt con chép phạt 100 lần bài tập đó.",
                    "Tìm hiểu rào cản: Con chưa hiểu bài? Con bị mệt mỏi sau ngày dài? Hay bài tập quá khó khiến con nản lòng?",
                    "Cắt toàn bộ cơm tối cho đến khi nào con chịu hoàn thành bài tập.",
                    "Làm bài tập thay cho con để nộp cho cô giáo đúng giờ vào sáng mai."
                ],
                "correctIndex": 1,
                "explanation": "Hành vi từ chối thường là dấu hiệu của sự bế tắc: trẻ chưa nắm vững kiến thức, quá tải, hoặc thiếu tự tin. Tìm ra nguyên nhân giúp cha mẹ hỗ trợ con gỡ rối học tập hiệu quả."
            },
            {
                "id": "q10",
                "question": "Một thiếu niên 15 tuổi đóng sập cửa phòng và hét lên: 'Bố mẹ để con yên, bố mẹ chẳng hiểu gì về con cả!'. Đâu là phản ứng giải quyết vấn đề khôn ngoan?",
                "options": [
                    "Đạp tung cửa xông vào, tát cho con một cái vì tội 'hỗn láo và chống đối cha mẹ'.",
                    "Để cho con không gian yên tĩnh hạ hỏa, sau đó nhẹ nhàng gõ cửa nói: 'Bố mẹ thấy con đang rất bực. Khi nào con sẵn sàng, bố mẹ luôn ở đây lắng nghe con'.",
                    "Tuyên bố từ mặt con và cắt đứt toàn bộ chi phí sinh hoạt của con.",
                    "Khóa trái cửa ngoài nhốt con trong phòng suốt cả kỳ nghỉ cuối tuần."
                ],
                "correctIndex": 1,
                "explanation": "Thiếu niên cần thời gian để tự điều chỉnh cơn bão cảm xúc. Tôn trọng ranh giới tạm thời của con và mở cánh cửa sẵn sàng lắng nghe giúp duy trì chiếc cầu nối tình cảm giữa cha mẹ và con cái."
            },
            {
                "id": "q11",
                "question": "Mô hình giải quyết vấn đề giúp chuyển đổi tư duy của cha mẹ từ trạng thái nào sang trạng thái nào?",
                "options": [
                    "Từ 'Người cảnh sát trừng phạt kẻ phạm tội' sang 'Người thầy hướng dẫn và đồng hành cùng con'.",
                    "Từ 'Người yêu thương dịu dàng' sang 'Vị chỉ huy quân đội nghiêm khắc'.",
                    "Từ 'Người giải quyết hòa bình' sang 'Người áp dụng các biện pháp bạo lực có kiểm soát'.",
                    "Từ 'Cha mẹ có trách nhiệm' sang 'Cha mẹ hoàn toàn phó mặc cho số phận'."
                ],
                "correctIndex": 0,
                "explanation": "Thay vì coi con là kẻ phạm tội cần bị trừng phạt, cha mẹ nhìn nhận con như một học trò đang thiếu kỹ năng và cần người thầy kiên nhẫn hướng dẫn cách làm đúng."
            },
            {
                "id": "q12",
                "question": "Yếu tố nào sau đây quyết định sự thành bại lâu dài của quá trình giải quyết vấn đề?",
                "options": [
                    "Sức mạnh cơ bắp và âm lượng giọng nói cực lớn của cha mẹ.",
                    "Sự bình tĩnh, khả năng tự kiểm soát cảm xúc của chính cha mẹ và sự tôn trọng đối thoại hai chiều.",
                    "Việc sử dụng các bản hợp đồng pháp lý có công chứng giữa cha mẹ và con cái.",
                    "Sự can thiệp của lực lượng an ninh mỗi khi xảy ra tranh luận gia đình."
                ],
                "correctIndex": 1,
                "explanation": "Cha mẹ không thể dạy con bình tĩnh nếu chính mình đang gào thét. Khả năng tự điều hòa cảm xúc của cha mẹ là tấm gương phản chiếu trực tiếp lên cách trẻ học giải quyết vấn đề."
            }
        ]
    },
    "05_chuong_5": {
        "chapterTitle": "Chương 5: Phản ứng bằng kỷ luật tích cực",
        "questions": [
            {
                "id": "q1",
                "question": "Quy trình phản ứng bằng Kỷ luật tích cực khi đối mặt với tình huống thách thức gồm bao nhiêu bước?",
                "options": [
                    "3 bước",
                    "4 bước",
                    "5 bước",
                    "7 bước"
                ],
                "correctIndex": 2,
                "explanation": "Quy trình gồm 5 bước bài bản: Bước 1: Nhớ lại mục tiêu lâu dài; Bước 2: Cung cấp sự ấm áp; Bước 3: Cung cấp cấu trúc; Bước 4: Hiểu cách trẻ nghĩ và cảm nhận; Bước 5: Phản ứng bằng giải pháp tích cực."
            },
            {
                "id": "q2",
                "question": "Bước 1 trong quy trình phản ứng - 'Nhớ lại mục tiêu lâu dài' - có tác dụng tức thời gì cho cha mẹ?",
                "options": [
                    "Giúp cha mẹ lập tức ngừng cơn giận bốc hỏa, không buông lời sỉ nhục hay ra tay đánh đập con.",
                    "Giúp con tự động xin lỗi và dọn dẹp phòng ngủ ngay lập tức.",
                    "Giúp cha mẹ có thời gian gọi điện cho chuyên gia tư vấn tâm lý.",
                    "Làm cho đứa trẻ cảm thấy sợ hãi trước ánh mắt im lặng của cha mẹ."
                ],
                "correctIndex": 0,
                "explanation": "Nhớ lại mục tiêu 20 năm sau đóng vai trò như chiếc phanh hãm tâm lý, kéo cha mẹ ra khỏi cơn thịnh nộ bản năng và nhắc nhở cha mẹ về mẫu hình người lớn mà mình muốn làm gương cho con."
            },
            {
                "id": "q3",
                "question": "Khi trẻ 3 tuổi nằm lăn ra đất gào khóc tại khu mua sắm vì đòi kẹo, cách phản ứng nào tuân thủ đúng 5 bước Kỷ luật tích cực?",
                "options": [
                    "Tát vào mông con thật đau và kéo lê con ra khỏi cửa hàng trước sự chứng kiến của mọi người.",
                    "Bình tĩnh quỳ xuống ngang tầm mắt, ôm con nhẹ nhàng, công nhận con đang thèm kẹo nhưng kiên định giải thích hôm nay gia đình chỉ mua thức ăn, rồi dắt con sang quầy trái cây chọn quả con thích.",
                    "Mua ngay cho con 3 gói kẹo lớn để con nín khóc ngay lập tức.",
                    "Để mặc con nằm ở sàn siêu thị và giả vờ như không quen biết đứa trẻ này."
                ],
                "correctIndex": 1,
                "explanation": "Hành động này kết hợp trọn vẹn: Ấm áp (ôm ấp, thấu hiểu cảm xúc thèm kẹo), Cấu trúc (ranh giới không mua kẹo hôm nay), và Giải pháp thay thế (cho con chọn trái cây tốt cho sức khỏe)."
            },
            {
                "id": "q4",
                "question": "Tại sao việc trừng phạt bằng cách 'Đánh đòn / Đánh vào tay / Tát' lại bị khoa học và tài liệu này kịch liệt phản đối?",
                "options": [
                    "Vì đánh đòn dạy trẻ rằng kẻ mạnh có quyền dùng vũ lực, làm tăng nguy cơ hung hăng, trầm cảm, lo âu và làm rạn nứt sự gắn kết tin cậy.",
                    "Vì roi mây hiện nay rất khó tìm mua trên thị trường hiện đại.",
                    "Vì đánh đòn sẽ làm đứa trẻ trở nên quá thông minh và kiêu ngạo.",
                    "Vì pháp luật quy định chỉ có giáo viên ở trường mới được quyền đánh học sinh."
                ],
                "correctIndex": 0,
                "explanation": "Hàng trăm nghiên cứu trên thế giới đã chứng minh: Trừng phạt thể xác không hề dạy được bài học đạo đức nào, mà gây tổn hại cấu trúc não bộ, gia tăng tỷ lệ tội phạm và hành vi bạo lực gia đình khi trưởng thành."
            },
            {
                "id": "q5",
                "question": "Hành động 'Nhốt trẻ một mình vào phòng tối / góc phạt lạnh lẽo' (Time-out cô lập) gây ra tác hại tâm lý gì?",
                "options": [
                    "Giúp trẻ nhanh chóng ngộ ra chân lý và biết ơn cha mẹ sâu sắc.",
                    "Kích hoạt cảm giác sợ hãi bị bỏ rơi, cô độc và làm trẻ cảm thấy mình là kẻ tồi tệ, không đáng được yêu thương.",
                    "Giúp trẻ có cơ hội suy ngẫm sâu sắc về các triết lý nhân sinh.",
                    "Làm tăng khả năng tập trung đọc sách của trẻ trong phòng tối."
                ],
                "correctIndex": 1,
                "explanation": "Khi bị cô lập lúc đang ngập tràn cảm xúc đau khổ, trẻ cảm thấy bị bỏ rơi và căm ghét người trừng phạt mình, chứ không hề có khả năng 'suy nghĩ về lỗi lầm' như người lớn lầm tưởng."
            },
            {
                "id": "q6",
                "question": "Thay vì 'Time-out cô lập', Kỷ luật tích cực khuyến khích sử dụng phương pháp 'Time-in' (Khoảng lặng kết nối), nghĩa là gì?",
                "options": [
                    "Cha mẹ và con cùng ngồi lại ở một góc yên tĩnh, ôm ấp hoặc ở cạnh con để hỗ trợ con bình tâm lại trước khi nói chuyện.",
                    "Bắt con phải đứng nghiêm như bộ đội trong suốt 60 phút liên tục.",
                    "Cho con sử dụng điện thoại thông minh không giới hạn thời gian để con nín khóc.",
                    "Mời tất cả họ hàng đến chứng kiến và cùng phân tích lỗi sai của đứa trẻ."
                ],
                "correctIndex": 0,
                "explanation": "'Time-in' là đồng hành cùng con trong cơn bão cảm xúc. Người lớn đóng vai trò là 'chiếc mỏ neo' vững chắc giúp hệ thần kinh của trẻ hạ nhiệt và cảm thấy an toàn."
            },
            {
                "id": "q7",
                "question": "Khi trẻ 5 tuổi vô tình làm vỡ cốc thủy tinh yêu thích của mẹ, phản ứng tích cực của mẹ là gì?",
                "options": [
                    "Hét toáng lên: 'Trời ơi là trời! Mày có mắt như mù vậy! Cút ngay ra ngoài!'",
                    "Kiểm tra xem con có bị mảnh kính đâm vào tay không, trấn an con rằng ai cũng có lúc sơ suất, rồi hướng dẫn con đứng yên để mẹ quét dọn an toàn.",
                    "Bắt con nhặt từng mảnh thủy tinh vỡ bằng tay trần để dạy con bài học cẩn thận.",
                    "Đánh vào mông con 3 roi để lần sau không bao giờ dám đến gần bàn nước nữa."
                ],
                "correctIndex": 1,
                "explanation": "Đặt sự an toàn và cảm xúc của con lên trên đồ vật vật chất. Trấn an và hướng dẫn cách xử lý sự cố dạy con lòng trắc ẩn và sự bình tĩnh khi đối mặt với rủi ro trong cuộc sống."
            },
            {
                "id": "q8",
                "question": "Trẻ 8 tuổi không chịu ăn rau trong bữa cơm và chỉ đòi ăn thịt chiên. Đâu là giải pháp vừa ấm áp vừa có cấu trúc?",
                "options": [
                    "Bóp miệng con nhét rau vào họng và bắt nuốt trọn.",
                    "Tôn trọng khẩu vị của con nhưng đưa ra cấu trúc: 'Mỗi bữa con thử ăn ít nhất 2 miếng rau nhỏ để cơ thể có đủ vitamin, con có thể chọn ăn súp lơ luộc hoặc dưa chuột xào'.",
                    "Chiều theo ý con hoàn toàn, từ nay về sau cả nhà chỉ nấu thịt chiên không bao giờ mua rau nữa.",
                    "Cấm con không được bước ra khỏi bàn ăn suốt đêm cho đến khi nào ăn hết đĩa rau."
                ],
                "correctIndex": 1,
                "explanation": "Đưa ra sự lựa chọn trong giới hạn rõ ràng (Limited Choices): con được quyền chọn loại rau con thích ăn hơn, nhưng nguyên tắc ăn uống cân bằng vẫn được duy trì mà không cần ép buộc thô bạo."
            },
            {
                "id": "q9",
                "question": "Khi trẻ 11 tuổi bị phát hiện lấy trộm tiền trong ví của mẹ để mua đồ chơi cho bạn bè nhằm lấy lòng, cha mẹ nên làm gì?",
                "options": [
                    "Đưa con ra đồn công an để công an giam giữ và dọa nạt cho con sợ.",
                    "Tìm hiểu động cơ (con đang khao khát được bạn bè chấp nhận), giải thích tính chất nghiêm trọng của việc lấy đồ không hỏi, và cùng con lên kế hoạch làm việc nhà tích lũy tiền hoàn trả lại ví.",
                    "Treo biển 'Tôi là kẻ ăn trộm' lên cổ con và bắt đi diễu hành quanh xóm.",
                    "Đánh đập con tàn nhẫn và đuổi con ra khỏi nhà để con tự đi kiếm ăn."
                ],
                "correctIndex": 1,
                "explanation": "Hiểu động cơ tâm lý giúp giải quyết căn nguyên (nhu cầu hòa nhập bạn bè), đồng thời cấu trúc bồi hoàn lao động dạy con giá trị của tiền bạc và phục hồi phẩm giá thay vì hủy hoại nhân phẩm con bằng sự sỉ nhục."
            },
            {
                "id": "q10",
                "question": "Một thiếu niên 16 tuổi đi chơi về muộn hơn giờ giới nghiêm 2 tiếng mà không gọi điện thông báo. Sáng hôm sau cha mẹ nên xử lý thế nào?",
                "options": [
                    "Đợi con về lúc nửa đêm, cầm chổi quét nhà lao vào đánh và chửi bới thậm tệ.",
                    "Đợi đến khi cả hai bên đã ngủ đủ giấc và bình tĩnh, bày tỏ sự lo lắng thót tim của cha mẹ, lắng nghe lý do của con, và cùng con điều chỉnh lại quy tắc báo cáo an toàn và hậu quả hợp lý cho lần sau.",
                    "Cấm con không bao giờ được bước chân ra khỏi cửa nhà cho đến khi đủ 18 tuổi.",
                    "Coi như không có chuyện gì xảy ra vì tuổi trẻ đứa nào chẳng đi chơi muộn."
                ],
                "correctIndex": 1,
                "explanation": "Nói chuyện khi bình tĩnh giúp cuộc đối thoại mang tính xây dựng. Thể hiện sự lo lắng vì tình yêu thương thay vì giận dữ thể hiện sự ấm áp; thảo luận về trách nhiệm thông tin thể hiện cấu trúc an toàn."
            },
            {
                "id": "q11",
                "question": "Tại sao việc 'Phê bình nhân cách' (ví dụ: 'Mày là đứa lười biếng, hư hỏng, đồ vô tích sự') lại cực kỳ nguy hại cho trẻ?",
                "options": [
                    "Vì trẻ sẽ khắc sâu những nhãn mác đó vào tiềm thức và hành xử đúng như những gì cha mẹ đã dán nhãn lên mình (hiệu ứng tiên tri tự ứng nghiệm).",
                    "Vì trẻ sẽ ghi âm lại lời phê bình đó để đem đi kiện tại tòa án gia đình.",
                    "Vì người ngoài nghe thấy sẽ chê cười cha mẹ không biết dùng từ hoa mỹ.",
                    "Vì lời phê bình sẽ làm con mất đi hứng thú với các trò chơi điện tử."
                ],
                "correctIndex": 0,
                "explanation": "Khi bị cha mẹ liên tục gán nhãn tiêu cực, đứa trẻ sẽ đánh mất lòng tự trọng và tin rằng bản thân mình vốn là kẻ xấu xa, lười biếng, từ đó buông xuôi và cư xử ngày càng tồi tệ hơn."
            },
            {
                "id": "q12",
                "question": "Thay vì chỉ trích con người, cha mẹ áp dụng Kỷ luật tích cực sẽ tập trung vào điều gì?",
                "options": [
                    "Tập trung vào trang phục và kiểu tóc của trẻ mỗi khi ra ngoài.",
                    "Tách biệt giữa con người của con (vốn luôn được yêu thương) và hành vi cụ thể của con (cần được chấn chỉnh và học cách làm tốt hơn).",
                    "Tập trung vào bảng điểm số học tập của con so với những đứa trẻ hàng xóm.",
                    "Chỉ trích các chương trình truyền hình mà đứa trẻ đang theo dõi."
                ],
                "correctIndex": 1,
                "explanation": "Nguyên tắc vàng: 'Cha mẹ luôn yêu thương con, nhưng hành vi đánh bạn / vứt rác này là không thể chấp nhận được'. Tách con người khỏi hành vi giúp bảo vệ lòng tự trọng của trẻ."
            },
            {
                "id": "q13",
                "question": "Tài liệu nhắc đến hiện tượng 'Trầm cảm sau sinh' ở các bà mẹ nhằm mục đích gì?",
                "options": [
                    "Để khuyến khích các bà mẹ bỏ mặc việc nuôi dạy con cho người giúp việc.",
                    "Để xã hội và gia đình thấu hiểu, sẻ chia gánh nặng, phát hiện sớm các vấn đề tâm lý để người mẹ được hỗ trợ y tế kịp thời thay vì bị phán xét.",
                    "Để chứng minh phụ nữ không có khả năng nuôi dạy con cái tốt như nam giới.",
                    "Để tăng doanh thu cho các hãng dược phẩm sản xuất thuốc trầm cảm."
                ],
                "correctIndex": 1,
                "explanation": "Trầm cảm sau sinh là một bệnh lý y khoa có thật do biến động hormone và kiệt sức thể chất. Nhận thức đúng giúp gia đình đồng hành chăm sóc sức khỏe tinh thần cho người mẹ, từ đó bảo vệ đứa trẻ an toàn."
            },
            {
                "id": "q14",
                "question": "Khái niệm 'Nguyên tắc chuyển giao' (Transition principle) trong việc nuôi dạy trẻ nhỏ nhấn mạnh điều gì?",
                "options": [
                    "Việc chuyển giao quyền nuôi con cho ông bà nội ngoại khi cha mẹ bận rộn.",
                    "Việc chuẩn bị tâm lý và thông báo trước khi chuyển từ hoạt động này sang hoạt động khác để trẻ không bị bỡ ngỡ, sốc cảm xúc.",
                    "Việc chuyển trường học liên tục để trẻ rèn luyện khả năng thích nghi môi trường mới.",
                    "Việc chuyển nhượng tài sản thừa kế cho con cái từ sớm."
                ],
                "correctIndex": 1,
                "explanation": "Trẻ nhỏ mất nhiều thời gian hơn để chuyển đổi sự chú ý. Thông báo trước 5 phút, 2 phút hoặc dùng bài hát chuyển giao giúp trẻ chủ động kết thúc hoạt động cũ và hợp tác bước vào hoạt động mới."
            },
            {
                "id": "q15",
                "question": "Phản ứng bằng Kỷ luật tích cực mang lại trái ngọt gì cho gia đình sau nhiều năm kiên trì thực hành?",
                "options": [
                    "Một đứa con luôn im lặng tuyệt đối và không bao giờ bộc lộ bất kỳ cảm xúc riêng nào.",
                    "Một mối quan hệ gia đình tràn đầy sự gắn kết, tôn trọng, tin cậy lẫn nhau và những đứa con tự tin, bản lĩnh, giàu lòng nhân ái khi bước vào đời.",
                    "Một gia đình không bao giờ xảy ra bất cứ sự bất đồng ý kiến nào trong cuộc sống.",
                    "Tất cả các thành viên trong gia đình đều trở thành triệu phú tài chính."
                ],
                "correctIndex": 1,
                "explanation": "Kỷ luật tích cực không hứa hẹn tạo ra những đứa trẻ hoàn hảo như robot, mà xây dựng nên những con người trưởng thành có đạo đức, biết yêu thương, có tư duy phản biện và một mái ấm gia đình hạnh phúc bền vững."
            }
        ]
    },
    "06_ket_luan": {
        "chapterTitle": "Kết luận & Vài nét về tác giả",
        "questions": [
            {
                "id": "q1",
                "question": "Tác giả Joan E. Durrant khuyên cha mẹ nên làm gì ĐẦU TIÊN mỗi khi cảm thấy cơn tức giận của mình đang dâng trào tột độ?",
                "options": [
                    "Hét thật to vào mặt con để giải tỏa toàn bộ năng lượng tiêu cực.",
                    "Hít một hơi thật dài, nhắm mắt lại và tạm dừng một nhịp trước khi hành động.",
                    "Cầm ngay một vật dụng gần nhất để đập vỡ nhằm dằn mặt con.",
                    "Ngay lập tức gọi điện thoại mắng người bạn đời của mình."
                ],
                "correctIndex": 1,
                "explanation": "Quy tắc 'Dừng lại - Hít thở sâu' giúp kích hoạt hệ thần kinh phó giao cảm, làm giảm nhịp tim và ngăn chặn vỏ não trước trán bị 'bắt cóc' bởi cơn giận bộc phát."
            },
            {
                "id": "q2",
                "question": "Trong khoảnh khắc dừng lại hít thở sâu, ba điều cốt lõi cha mẹ cần nhanh chóng nhớ tới trong tâm trí là gì?",
                "options": [
                    "(1) Mục tiêu lâu dài; (2) Tầm quan trọng của sự ấm áp & cấu trúc; (3) Mức độ phát triển của con.",
                    "(1) Số tiền con đã làm hỏng; (2) Giờ làm việc sắp tới của mẹ; (3) Hình phạt nặng nhất có thể nghĩ ra.",
                    "(1) Lời dạy của thầy bói; (2) Bảng xếp hạng của con ở trường; (3) Cơn giận của ông bà.",
                    "(1) Chi phí mua sắm đồ chơi; (2) Áp lực từ cấp trên; (3) Uy tín cá nhân trước hàng xóm."
                ],
                "correctIndex": 0,
                "explanation": "Tác giả đúc kết 3 câu hỏi trọng tâm: Mình muốn con trở thành người thế nào sau 20 năm nữa? Lúc này con đang cần sự ấm áp hay cấu trúc? Con ở lứa tuổi này có khả năng hiểu đến đâu?"
            },
            {
                "id": "q3",
                "question": "Kỷ luật tích cực có phải là một phương pháp nhanh chóng mang lại kết quả thần kỳ ngay trong 1 giây không?",
                "options": [
                    "Có, chỉ cần áp dụng đúng công thức là trẻ sẽ ngoan ngoãn lập tức như có phép màu.",
                    "Không, đây là một quá trình giảng dạy dài hạn đòi hỏi sự kiên nhẫn, thực hành bền bỉ và học hỏi liên tục từ cả cha mẹ lẫn con cái.",
                    "Có, chỉ cần đọc xong cuốn sách này là cha mẹ không bao giờ phải dạy con thêm bất cứ điều gì nữa.",
                    "Không, phương pháp này chỉ có tác dụng trên lý thuyết sách vở và không thể áp dụng vào đời thực."
                ],
                "correctIndex": 1,
                "explanation": "Nuôi dạy con là một hành trình marathon chứ không phải cuộc chạy nước rút. Kỷ luật tích cực là lối sống và thái độ giáo dục kiên trì qua từng năm tháng."
            },
            {
                "id": "q4",
                "question": "Tiến sĩ Joan E. Durrant - tác giả cuốn sách - là chuyên gia trong lĩnh vực nào?",
                "options": [
                    "Tiến sĩ Kinh tế học lượng tử và Quản trị kinh doanh tại Phố Wall.",
                    "Tiến sĩ Tâm lý học trẻ em, Giáo sư tại Đại học Manitoba (Canada) và chuyên gia hàng đầu về quyền trẻ em.",
                    "Bác sĩ Phẫu thuật tim mạch tại Bệnh viện Hoàng gia Thụy Điển.",
                    "Luật sư chuyên giải quyết các tranh chấp thương mại quốc tế tại Geneve."
                ],
                "correctIndex": 1,
                "explanation": "TS. Joan E. Durrant là Giáo sư Tâm lý học trẻ em tại Đại học Manitoba (Canada), nhà nghiên cứu quốc tế có ảnh hưởng sâu rộng trong phong trào bảo vệ trẻ em khỏi bạo lực thể xác."
            },
            {
                "id": "q5",
                "question": "Tổ chức nào đã đồng hành cùng tác giả để thử nghiệm và nhân rộng chương trình PDEP tại hàng chục quốc gia trên thế giới?",
                "options": [
                    "Hiệp hội Cầu vồng Quốc tế",
                    "Tổ chức Cứu trợ Trẻ em (Save the Children)",
                    "Liên đoàn Bóng đá Thế giới (FIFA)",
                    "Tập đoàn Công nghệ Microsoft"
                ],
                "correctIndex": 1,
                "explanation": "Save the Children đã hợp tác chặt chẽ với TS. Joan Durrant để đưa chương trình PDEP vào hàng loạt quốc gia tại châu Á, châu Phi, châu Mỹ Latinh và Đông Âu."
            },
            {
                "id": "q6",
                "question": "Nếu trong quá khứ bạn đã từng lỡ quát mắng hoặc đánh con, Kỷ luật tích cực khuyên bạn nên làm gì?",
                "options": [
                    "Tự dằn vặt bản thân trong đau khổ suốt đời và không bao giờ tha thứ cho chính mình.",
                    "Chân thành xin lỗi con, giải thích rằng lúc đó cha/mẹ đã mất bình tĩnh và cam kết cùng con học cách ứng xử mới tích cực hơn.",
                    "Tiếp tục đánh con vì 'lỡ đánh một lần rồi thì đánh thêm nhiều lần nữa cũng không sao'.",
                    "Giả vờ như chuyện đó chưa từng xảy ra và cấm con không bao giờ được nhắc lại."
                ],
                "correctIndex": 1,
                "explanation": "Xin lỗi con là một bài học mẫu mực về lòng dũng cảm và trách nhiệm. Con sẽ học được rằng người lớn cũng có lúc sai, nhưng điều quan trọng nhất là biết nhận lỗi và sửa chữa."
            },
            {
                "id": "q7",
                "question": "Thông điệp gửi gắm lớn nhất của toàn bộ cuốn sách dành cho mỗi gia đình là gì?",
                "options": [
                    "Làm cha mẹ là công việc hoàn hảo và tuyệt đối không bao giờ được phép có bất kỳ sai sót nào.",
                    "Tình yêu thương, sự thấu hiểu và sự tôn trọng nhân phẩm chính là con đường đúng đắn và bền vững nhất để dẫn lối con trưởng thành.",
                    "Trẻ em chỉ nghe lời khi cha mẹ sở hữu thật nhiều quyền lực và tiền bạc.",
                    "Nhà trường phải chịu 100% trách nhiệm về sự hư hỏng hay nên người của một đứa trẻ."
                ],
                "correctIndex": 1,
                "explanation": "Tình yêu thương vô điều kiện đi đôi với ranh giới rõ ràng và sự tôn trọng là chìa khóa mở ra cánh cửa tâm hồn của trẻ, giúp con khôn lớn thành người tử tế và hạnh phúc."
            },
            {
                "id": "q8",
                "question": "Khi cha mẹ thay đổi từ phong cách bạo lực sang Kỷ luật tích cực, lợi ích lớn nhất đối với chính bản thân cha mẹ là gì?",
                "options": [
                    "Được nhận giải thưởng tiền mặt từ chính quyền địa phương.",
                    "Giảm bớt căng thẳng, cảm giác tội lỗi và tìm thấy niềm vui, sự thanh thản thực sự trong hành trình làm cha mẹ.",
                    "Không bao giờ phải dọn dẹp nhà cửa hay nấu cơm cho gia đình nữa.",
                    "Trở thành chuyên gia nổi tiếng trên tất cả các kênh truyền hình quốc gia."
                ],
                "correctIndex": 1,
                "explanation": "Nuôi dạy con không bạo lực giải thoát cha mẹ khỏi cảm giác dằn vặt, ân hận sau mỗi cơn giận dữ, mang lại sự bình an nội tâm và kết nối sâu sắc với con cái."
            },
            {
                "id": "q9",
                "question": "Khái niệm 'Kỷ luật tích cực trong thực hành làm cha mẹ HÀNG NGÀY' nhấn mạnh khía cạnh nào?",
                "options": [
                    "Chỉ áp dụng kỷ luật vào những ngày lễ tết hoặc cuối tuần khi gia đình có thời gian rảnh rỗi.",
                    "Phương pháp này áp dụng trong từng sinh hoạt đời thường bình dị: lúc thức dậy, ăn cơm, tắm rửa, học bài và chuẩn bị đi ngủ.",
                    "Mỗi ngày cha mẹ phải làm một bài kiểm tra trắc nghiệm 100 câu hỏi lý thuyết.",
                    "Phải thuê một gia sư về nhà giám sát con trong suốt 24 giờ mỗi ngày."
                ],
                "correctIndex": 1,
                "explanation": "Kỷ luật tích cực không phải là lý thuyết xa vời mà là hành động cụ thể trong từng tương tác nhỏ nhặt diễn ra mỗi ngày giữa cha mẹ và con cái dưới một mái nhà."
            },
            {
                "id": "q10",
                "question": "Hành trình thực hành Kỷ luật tích cực có thể bắt đầu từ khi nào?",
                "options": [
                    "Phải đợi đến khi đứa trẻ học xong đại học mới bắt đầu áp dụng được.",
                    "Bắt đầu ngay từ ngày hôm nay, từ khoảnh khắc tiếp theo bạn trò chuyện và nhìn vào mắt con mình.",
                    "Chỉ bắt đầu khi gia đình đã mua được một căn biệt thự rộng lớn có sân chơi.",
                    "Phải đợi đến khi đứa trẻ phạm phải một lỗi lầm vô cùng nghiêm trọng."
                ],
                "correctIndex": 1,
                "explanation": "Bạn có thể bắt đầu thực hành Kỷ luật tích cực ngay bây giờ: hít thở sâu, nở một nụ cười, lắng nghe con với sự ấm áp và trao cho con sự định hướng bằng tình yêu thương chân thành."
            }
        ]
    }
}

for chap_id, data in QUIZZES.items():
    file_path = os.path.join(OUTPUT_DIR, f"{chap_id}.json")
    quiz_obj = {
        "bookId": BOOK_ID,
        "chapterId": chap_id,
        "chapterTitle": data["chapterTitle"],
        "totalQuestions": len(data["questions"]),
        "questions": data["questions"]
    }
    with open(file_path, "w", encoding="utf-8") as f:
        json.dump(quiz_obj, f, ensure_ascii=False, indent=2)
    print(f"Created quiz {chap_id}.json with {len(data['questions'])} questions.")

print("All quizzes generated successfully!")
